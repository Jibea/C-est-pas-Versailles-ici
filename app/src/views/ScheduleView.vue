<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Schedule } from '@/types/Schedule';
import TopBar from '@/components/TopBar.vue';
import { SceneInfo } from '@/types/Scene';

const schedules = ref<Record<string, Schedule>>({});
const schedulesLoaded = ref(false);
const currentGroupId = ref<string>('');
const selectedSchedule = ref<Schedule | null>(null);
const daysOfWeek = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',];
const selectedDays = ref<string[]>([]);
const modifiedName = ref('');
const modifiedTime = ref('');
const scenes = ref<string[]>([]);
const selectedScene = ref<string>('');
const isAddFormVisible = ref(false);
const newScheduleName = ref('');
const newScheduleDescription = ref('');
const newScheduleCommandMethod = ref('PUT');
const newScheduleCommandBody = ref({});
const newScheduleStatus = ref('enabled');
const newScheduleAutodelete = ref(false);
const now = new Date();
const newScheduleTime = ref(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T00:00:00`);
const isModifyFormVisible = ref(false);

onMounted(() => {
    const route = useRoute();
    currentGroupId.value = route.params.groupId;
    getSchedule();
    getScenes();
    selectedScene.value = selectedSchedule.value?.sceneId || null;
});

const getSchedule = async () => {
  try {
    const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`);
    const filteredSchedules: Schedule[] = [];

    Object.entries(response.data).forEach(([key, schedule]: [string, unknown]) => {
      const typeSchedule = schedule as Schedule;
      if (typeSchedule.command.address.includes(`/groups/${currentGroupId.value}/`)) {
        typeSchedule.id = key;
        filteredSchedules.push(typeSchedule);
      }
    });

    schedules.value = filteredSchedules;
    schedulesLoaded.value = true;
  } catch (error) {
    console.error(error);
  }
};

const showDetails = (scheduleId: string) => {
    if (scheduleId !== undefined) {
        const schedule = Object.values(schedules.value).find((s) => s.id === scheduleId);

        if (schedule) {
            selectedSchedule.value = schedule;
            selectedDays.value = schedule.selectedDays || [];
            modifiedName.value = schedule.name || '';
            
            const timeFormat = schedule.localtime;

            if (timeFormat) {
                if (timeFormat.startsWith('W')) {
                    const daysBitmap = parseInt(timeFormat.substring(1), 10);
                    selectedDays.value = daysOfWeek.map((day, index) => (daysBitmap & (1 << (6 - index))) !== 0);
                    modifiedTime.value = '';
                } else if (timeFormat.startsWith('P')) {
                    modifiedTime.value = timeFormat.substring(1);
                } else if (timeFormat.startsWith('R')) {
                    modifiedTime.value = timeFormat.substring(1);
                } else {
                    modifiedTime.value = timeFormat;
                }
            } else {
                modifiedTime.value = '';
            }            
        } else {
            console.error(`Schedule with id ${scheduleId} not found`);
        }
        isModifyFormVisible.value = true;
    } else {
        console.error('Undefined scheduleId');
    }
};

const formatTimeToTimer = (time) => {
  const [hours, minutes] = time.split(':');
  return `T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

const formatDaysToRepeatedDays = (selectedDays) => {
  // eslint-disable-next-line
  const repeatedDays = selectedDays.map((day, _) => {
  const bit = day ? 1 : 0;
  return bit;
}).join('');
  const decimalValue = parseInt(repeatedDays, 2);

  return `W${decimalValue}`;
};

const commandAddress = computed(() => {
  return `/api/${process.env.VUE_APP_API_KEY}/groups/${currentGroupId.value}/scenes/${selectedScene.value}/recall`;
});

const saveModifiedSchedule = async () => {
  try {
    let requestData;

    requestData = {
      name: modifiedName.value || selectedSchedule.value?.name,
      command: {
        address: commandAddress.value,
        body: {},
        method: 'PUT',
      },
      status: selectedSchedule.value?.status,
      autodelete: selectedSchedule.value?.autodelete,
      time: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
      localtime: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
    };

    await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${selectedSchedule.value?.id}`, requestData);
    await getSchedule();

    selectedSchedule.value = null;
    modifiedName.value = '';
    modifiedTime.value = '';
    selectedDays.value = [];
    selectedScene.value = '';
    isModifyFormVisible.value = false;
  } catch (error) {
    console.error('Error updating schedule:', error);
  }
};

const toggleDay = (index: number) => {
  selectedDays.value[index] = !selectedDays.value[index];
};

const isSaveDisabled = computed(() => {
  return !modifiedTime.value || selectedScene.value === null;
});

const toggleActivation = async () => {
    try {
        const newStatus = selectedSchedule.value?.status === 'enabled' ? 'disabled' : 'enabled';
        await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${selectedSchedule.value?.id}`, { status: newStatus });
        selectedSchedule.value!.status = newStatus;
    } catch (error) {
        console.error('Error toggling schedule activation:', error);
    }
};

const getScenes = async () => {
  try {
    const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${currentGroupId.value}/scenes`);

    scenes.value = Object.entries(response.data).map(([id, scene]: [string, SceneInfo]) => {
      scene.id = id;
      return scene;
    });
  } catch (error) {
    console.error(error);
  }
};

const openAddScheduleForm = () => {
  isAddFormVisible.value = !isAddFormVisible.value;

  if (!isAddFormVisible.value) {
    newScheduleName.value = '';
    newScheduleDescription.value = '';
  }
};

const addSchedule = async () => {
  try {
    if (!newScheduleName.value.trim()) {
      console.error('Please enter a valid schedule name.');
      return;
    }

    const requestData = {
      name: newScheduleName.value,
      description: newScheduleDescription.value,
      command: {
        address: `/api/${process.env.VUE_APP_API_KEY}/groups/${currentGroupId.value}/action`,
        method: newScheduleCommandMethod.value,
        body: newScheduleCommandBody.value,
      },
      status: newScheduleStatus.value,
      autodelete: newScheduleAutodelete.value,
      time: newScheduleTime.value,
    };

    await axios.post(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`, requestData);
    await getSchedule();
    isAddFormVisible.value = false;
    newScheduleName.value = '';
  } catch (error) {
    console.error('Error adding schedule:', error);
  }
};

const deleteSchedule = async (scheduleId: string) => {
  try {
    await axios.delete(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${scheduleId}`);
    await getSchedule();
  } catch (error) {
    console.error(`Error deleting schedule ${scheduleId}:`, error);
  }
};

</script>

<template>

  <TopBar :title="'Schedule View'" />

  <div class="room-view">

    <div class="add-schedule-container">
      <button v-if="!isAddFormVisible" @click="openAddScheduleForm">Add Schedule</button>
      
      <!-- to add a schedule -->
      <div v-show="isAddFormVisible">
        <h2>Add Schedule</h2>
        <form @submit.prevent="addSchedule">
          <div>
            <label for="newScheduleName">Name:</label>
            <input v-model="newScheduleName" type="text" id="newScheduleName" />
          </div>
          <button type="submit">Add Schedule</button>
        </form>
      </div>
    </div>

    <!-- list of schedules -->
    <ul class="schedule-list">
      <li v-for="schedule in schedules" :key="schedule.id" class="schedule-item">
        {{ schedule.name }} - {{ schedule.localtime }}
        <button @click="showDetails(schedule.id)" class="details-button"> Show Details </button>
        <font-awesome-icon @click="deleteSchedule(schedule.id)" icon="trash" />
      </li>
    </ul>

    <!-- schedule details -->
    <div v-if="selectedSchedule" class="schedule-details">
      <h2>{{ selectedSchedule.name }} Details</h2>
      <p>Description: {{ selectedSchedule.description }}</p>
      <p>Time: {{ selectedSchedule.localtime }}</p>
      <button @click="toggleActivation" :class="{ 'activate-button': selectedSchedule.status === 'disabled', 'deactivate-button': selectedSchedule.status === 'enabled' }">
        {{ selectedSchedule.status === 'enabled' ? 'Deactivate' : 'Activate' }}
      </button>
    </div>

    <!-- modify schedule form -->
    <div v-if="isModifyFormVisible" class="modify-schedule-container">
      <h2>Modify Schedule</h2>
        <form @submit.prevent="saveModifiedSchedule">

          <!-- to change name -->
          <div>
            <label for="name">Name:</label>
            <input v-model="modifiedName" type="text" id="name" />
          </div>

          <!-- to change time -->
          <div>
            <label for="time">Time:</label>
            <input v-model="modifiedTime" type="time" id="time" />
          </div>

          <!-- to choose days -->
          <div>
            <div>
              <div class="days-row">
                <label for="days">Select Days:</label>
                <div class="day-checkbox" v-for="(day, index) in daysOfWeek" :key="index" @click="toggleDay(index)">
                  <div :class="{ 'checked': selectedDays[index] }">{{ day.substring(0, 2) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- to choose a scene -->
          <div>
            <label for="scene">Select Scene:</label>
            <select v-model="selectedScene" id="scene">
              <option :value="null">No Scene Selected</option>
              <option v-for="(scene, index) in scenes" :key="index" :value="scene.id">{{ scene.name }}</option>
            </select>
          </div>

          <button type="submit" :disabled="isSaveDisabled">Save Changes</button>
        </form>
    </div>

  </div>
</template>

<style scoped>

.selected {
    background-color: lightblue;
  }

  .days-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}


.day-checkbox {
  cursor: pointer;
  margin-right: 20px;
  margin-bottom: 10px;
  display: flex;
}

.day-checkbox div {
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-checkbox div.checked {
  background-color: lightgrey;
}
.room-view {
  padding: 20px;
}

.add-schedule-container {
  align-items: center;
  margin-bottom: 20px;
}

.schedule-list {
  list-style-type: none;
  padding: 0;
}

.schedule-item {
    border: 1px solid #ccc;
    margin: 0 auto;
    margin-bottom: 5px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 700px;
    width: 100%;
  }

.schedule-details {
  margin-top: 20px;
}

.modify-schedule-container {
  margin-top: 20px;
}

.modify-schedule-container form {
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
  }

  .modify-schedule-container label {
    margin-bottom: 8px;
    font-weight: bold;
  }

  .modify-schedule-container input,
  .modify-schedule-container select,
  .modify-schedule-container button {
    margin-bottom: 16px;
    padding: 8px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
  }

  .modify-schedule-container button {
    background-color: #4caf50;
    color: white;
    cursor: pointer;
  }

  .modify-schedule-container button:disabled {
    background-color: #ddd;
    color: #666;
    cursor: not-allowed;
  }

  button {
    padding: 10px;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #45a049;
  }

  .activate-button {
    background-color: #5cb85c;
  }

  .deactivate-button {
    background-color: #d9534f;
  }

  .activate-button:hover,
  .deactivate-button:hover {
    background-color: #4cae4c;
  }

  .details-button {
    padding: 10px;
    background-color: #999;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .details-button:hover {
    background-color: #ccc;
  }

  .add-schedule-container form > div {
    margin-bottom: 10px;
  }

</style>
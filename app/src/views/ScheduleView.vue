<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Schedule } from '@/types/Schedule';
import TopBar from '@/components/TopBar.vue';

const schedules = ref<Record<string, Schedule>>({});
const schedulesLoaded = ref(false);
const currentGroupId = ref<string>('');
const selectedSchedule = ref<Schedule | null>(null);
const daysOfWeek = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',];
const selectedDays = ref<string[]>([]);
const isModifyFormVisible = ref(false);
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

onMounted(() => {
    const route = useRoute();
    currentGroupId.value = route.params.groupId;
    getSchedule();
    getScenes();
});

const getSchedule = async () => {
  try {
    const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`);
    console.log('All Schedules response.data:', response.data);
    const filteredSchedules: Schedule[] = [];

    Object.entries(response.data).forEach(([key, schedule]: [string, unknown]) => {
      const typeSchedule = schedule as Schedule;
      if (typeSchedule.command.address.includes(`/groups/${currentGroupId.value}/`)) {
        typeSchedule.id = key;
        filteredSchedules.push(typeSchedule);
      }
    });

    console.log('Filtered Schedules:', filteredSchedules);

    schedules.value = filteredSchedules;
    schedulesLoaded.value = true;
  } catch (error) {
    console.error(error);
  }
};

const showDetails = (scheduleId: string) => {
    console.log('Clicked on scheduleId:', scheduleId);

    if (scheduleId !== undefined) {
        const schedule = Object.values(schedules.value).find((s) => s.id === scheduleId);

        console.log('Schedule object:', schedule);

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
            
            console.log(`Show details for schedule ${scheduleId}`);
        } else {
            console.error(`Schedule with id ${scheduleId} not found`);
        }
    } else {
        console.error('Undefined scheduleId');
    }
};

const formatTimeToTimer = (time) => {
  const [hours, minutes] = time.split(':');
  return `T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
};

const formatDaysToRepeatedDays = (selectedDays) => {
  const repeatedDays = selectedDays.map((day, index) => {
    const bit = day ? 1 : 0;
    console.log(`Day ${index + 1}: ${bit}`);
    return bit;
  }).join('');
  const decimalValue = parseInt(repeatedDays, 2);

  console.log('Reversed days:', selectedDays.map((day, index) => (day ? 1 : 0)));
  console.log('Binary representation:', repeatedDays);
  console.log('Decimal value:', decimalValue);

  return `W${decimalValue}`;
};

const saveModifiedSchedule = async () => {
  try {
    let requestData;

    if (modifiedName.value === 'call scene') {
      requestData = {
        name: modifiedName.value || selectedSchedule.value?.name,
        command: {
          address: `/api/${process.env.VUE_APP_API_KEY}/scenes/${selectedScene.value}/recall`,
          body: {},
          method: 'PUT',
        },
        status: selectedSchedule.value?.status,
        autodelete: selectedSchedule.value?.autodelete,
        time: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
        localtime: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
      };
    } else {
      requestData = {
        name: modifiedName.value || selectedSchedule.value?.name,
        description: selectedSchedule.value?.description,
        command: selectedSchedule.value?.command,
        status: selectedSchedule.value?.status,
        autodelete: selectedSchedule.value?.autodelete,
        time: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
        localtime: formatDaysToRepeatedDays(selectedDays.value) + '/' + formatTimeToTimer(modifiedTime.value || selectedSchedule.value?.time),
      };
    }

    console.log('Modified schedule:', requestData, "for id ", selectedSchedule.value?.id);

    await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${selectedSchedule.value?.id}`, requestData);
    await getSchedule();
    isModifyFormVisible.value = false;

    console.log('Schedule updated successfully');
  } catch (error) {
    console.error('Error updating schedule:', error);
  }
};


const toggleDay = (index: number) => {
  selectedDays.value[index] = !selectedDays.value[index];
};

const isSaveDisabled = computed(() => {
  return !modifiedTime.value;
});

const toggleActivation = async () => {
    try {
        const newStatus = selectedSchedule.value?.status === 'enabled' ? 'disabled' : 'enabled';
        await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${selectedSchedule.value?.id}`, { status: newStatus });
        selectedSchedule.value!.status = newStatus;
        console.log(`Schedule ${selectedSchedule.value?.id} ${newStatus === 'enabled' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
        console.error('Error toggling schedule activation:', error);
    }
};

const getScenes = async () => {
  try {
    const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${currentGroupId.value}/scenes`);
    console.log('All Scenes response.data:', response.data);

    scenes.value = Object.values(response.data).map((scene: any) => scene.name);
  } catch (error) {
    console.error(error);
  }
};

const openAddScheduleForm = () => {
  isAddFormVisible.value = true;
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
    console.log('Schedule added successfully');
  } catch (error) {
    console.error('Error adding schedule:', error);
  }
};

const deleteSchedule = async (scheduleId: string) => {
  try {
    await axios.delete(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules/${scheduleId}`);
    await getSchedule();
    console.log(`Schedule ${scheduleId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting schedule ${scheduleId}:`, error);
  }
};

</script>

<template>
  <div>
    <TopBar :title="'Schedule View'" />
  </div>

  <div class="room-view">

    <button @click="openAddScheduleForm">Add Schedule</button>

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

    <ul>
      <li v-for="schedule in schedules" :key="schedule.id">
        {{ schedule.name }} - {{ schedule.localtime }}
        <button @click="showDetails(schedule.id)">Show Details (ID: {{ schedule.id }})</button>
        <button @click="deleteSchedule(schedule.id)">Delete</button>
      </li>
    </ul>

    <div v-if="selectedSchedule">
      <h2>{{ selectedSchedule.name }} Details</h2>
      <p>Description: {{ selectedSchedule.description }}</p>
      <p>Time: {{ selectedSchedule.localtime }}</p>
      <button @click="toggleActivation">{{ selectedSchedule.status === 'enabled' ? 'Deactivate' : 'Activate' }}</button>
    </div>

    <div>
      <h2>Modify Schedule</h2>
        <form @submit.prevent="saveModifiedSchedule">
          <div>
            <label for="name">Name:</label>
            <input v-model="modifiedName" type="text" id="name" />
          </div>
          <div>
            <label for="time">Time:</label>
            <input v-model="modifiedTime" type="time" id="time" />
          </div>

          <div>
            <div>
              {{ selectedDays }}
              <div class="days-row">
                <label for="days">Select Days:</label>
                <div class="day-checkbox" v-for="(day, index) in daysOfWeek" :key="index" @click="toggleDay(index)">
                  <div :class="{ 'checked': selectedDays[index] }">{{ day.substring(0, 2) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="scene">Select Scene:</label>
            <select v-model="selectedScene" id="scene">
              <option v-for="(scene, index) in scenes" :key="index" :value="scene">{{ scene }}</option>
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


</style>
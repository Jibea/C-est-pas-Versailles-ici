<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GroupAttributes } from '@/types/GroupAttributes';
import axios from 'axios';
import Light from '@/types/Light';
import TopBar from '@/components/TopBar.vue';

const router = useRouter();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const roomName = decodeURIComponent(router.currentRoute.value.params.roomName);
const group = ref<GroupAttributes>();
const lights = ref<Light[]>([]);
const selectedTab = ref('lights');
const renameDialogOpen = ref(false);
const newGroupName = ref('');
const isSearching = ref(false);
const timer = ref(0);

onMounted(() => {
    getGroup();
});

const fixMessageSyntax = () => {
    newGroupName.value = newGroupName.value.replaceAll("-", " ")
    const separate = newGroupName.value.split(" ")
    newGroupName.value = ""
    for (let i = 0; i < separate.length - 1; i++) {
        if (separate[i].length > 0)
            newGroupName.value += separate[i] + " "
    }
    if (separate[separate.length - 1].length > 0)
    newGroupName.value += separate[separate.length - 1]
}

const getGroup = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}`);
        group.value = response.data;
        console.log('Group data: ', response.data);

        if (group.value?.lights) {
            group.value.lights.forEach((lightId: string) => {
                getLight(lightId);
            });
        }
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const getLight = async (lightId: string) => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${lightId}`);
        const lightData = response.data;
        lightData.id = lightId;

        // Pour initialiser les valeurs de brightness et temperature du slider lors du reload de la page
        lightData.state.brightness = lightData.state.bri;
        lightData.state.temperature = lightData.state.ct;

        lights.value.push(lightData);
        console.log('Light data: ', lightData);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const showLights = () => {
  selectedTab.value = 'lights';
}

const editGroup = () => {
  selectedTab.value = 'editGroup';
}

const openRenameDialog = () => {
  renameDialogOpen.value = true;
}

const cancelRename = () => {
  renameDialogOpen.value = false;
  newGroupName.value = '';
}

const renameGroup = async () => {
  try {
    newGroupName.value = roomName.value + "-" + newGroupName.value
    const response = await axios.put(
      `http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}`,
      { name: newGroupName.value }
    );
    group.value = response.data;
    renameDialogOpen.value = false;
    newGroupName.value = '';
    await getGroup();
  } catch (error) {
    console.error('Error API: ', error);
  }
}

const toggleLight = async (light: Light) => {
  try {
    const payload = { on: light.state.on };

    const response = await axios.put(
      `http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${light.id}/state`,
      payload
    );
    console.log('Light state updated:', response.data);
  } catch (error) {
    console.error('Error updating light state: ', error);
  }
};

const searchLights = async () => {
    try {
        isSearching.value = true;
        setTimer(60);
        await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/config`, {permitjoin: 60});
      } catch (error) {
        console.error('Error API: ', error);
    }
};

const setTimer = (time: number) => {
    timer.value = time;
    const interval = setInterval(() => {
        console.log(timer);
        timer.value--;
        if (timer.value === 0) {
            isSearching.value = false;
            clearInterval(interval);
        }
    }, 1000);
}

const updateLightState = async (lightId: string) => {
  const light = lights.value.find((l) => l.id === lightId);

  if (!light) {
    console.error('Light not found:', lightId);
    return;
  }

  const validBrightness = Math.min(255, Math.max(0, light.state.brightness));
  const validTemperature = Math.min(light.ctmax, Math.max(light.ctmin, light.state.temperature));

  const payload = {
    on: light.state.on,
    bri: validBrightness,
    ct: validTemperature,
  };

  try {
    const response = await axios.put(
      `http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${lightId}/state`,
      payload
    );

    console.log('Light state updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating light state:', error);
  }
};

</script>

<template>
  <div class="group-view">
    <TopBar :title="group?.name ? group.name : 'Group'" />
    <h1>
      <span>{{ group?.name }}</span>
      <font-awesome-icon
        :icon="['fas', 'pen']"
        style="color: #706d74; cursor: pointer; margin-left: 10px;"
        @click="openRenameDialog"
      />
    </h1>
    <p class="group-id">Group ID: {{ group?.id }}</p>

    <button @click="showLights">Show Lights</button>
    <button @click="editGroup">Edit Group</button>

    <!-- dialogue pour rename le groupe -->
    <div v-if="renameDialogOpen" class="rename-dialog">
      <input v-model="newGroupName" type="text" placeholder="Enter new group name" maxlength="15" v-on:input="fixMessageSyntax"/>
      <button @click="cancelRename">Cancel</button>
      <button @click="renameGroup">Rename</button>
    </div>

    <!-- pour montrer les lights -->
    <div v-if="selectedTab === 'lights'">
      <ul class="light-list">
        <li v-for="light in lights" :key="light.id" class="light-item">
          <div class="light-info">
            <p class="light-name">{{ light.name }}</p>
            <p class="light-state">{{ light.state.on ? 'On' : 'Off' }}</p>
            <p class="light-manufacturer">Manufacturer: {{ light.manufacturername }}</p>
            <p class="light-manufacturer">Model: {{ light.modelid }}</p>
            <p class="light-manufacturer">Unique ID: {{ light.uniqueid }}</p>
          </div>

          <div class="light-controls">

            <!-- toggle switch pour eteindre/allumer les lampes -->
            <label class="switch">
              <input type="checkbox" v-model="light.state.on" @change="toggleLight(light)">
              <span class="slider"></span>
            </label>

            <!-- Brightness Slider -->
            <div class="slider-container">
              <label>Brightness: {{ light.state.brightness }}</label>
              <input type="range" min="0" max="255" v-model="light.state.brightness" @input="updateLightState(light.id)" class="brightness-slider"/>
            </div>

            <!-- Temperature Slider -->
            <div class="slider-container">
              <label>Temperature: {{ light.state.temperature }}</label>
              <input type="range" min="153" max="370" v-model="light.state.temperature" @input="updateLightState(light.id)" class="temperature-slider"/>
            </div>
          </div>

        </li>
      </ul>
    </div>

    <!-- pour edit les groupes -->
    <div v-if="selectedTab === 'editGroup'" class="edit-group-section">

      <router-link :to="{ name: 'editSceneRoute', params: { groupId: group?.id } }">
        <button>Scene Editor</button>
      </router-link>

      <router-link :to="{ name: 'manageLightsRoute', params: { groupId: group?.id } }">
        <button>Manage Lights</button>
      </router-link>

      <router-link :to="{ name: 'scheduleRoute', params: { groupId: group?.id } }">
        <button>Schedule</button>
      </router-link>
      
      <router-link :to="{ name: 'sensorsControlRoute', params: { groupId: group?.id } }">
        <button>Sensor Control</button>
      </router-link>

      <button @click="searchLights">Search New Lights</button>

    </div>
    <div>
      <div v-if="isSearching" class="modalSearching">
        <div class="modalSearching-content">
            <p>Searching for new lights. Time remaining: {{ timer}} seconds</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.group-id {
  font-size: 16px;
  margin-bottom: 15px;
}

.light-list {
  list-style: none;
  padding: 0;
}

.light-item {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
}

.light-info {
  display: flex;
  flex-direction: column;
}

.light-state {
  font-size: 16px;
  color: #4CAF50;
  margin-bottom: 5px;
}

.light-manufacturer {
  font-size: 14px;
  color: #888;
}

button {
  padding: 10px;
  margin: 5px;
  font-size: 16px;
  cursor: pointer;
  background-color: #3f473f;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #45a049;
}

button:active {
  background-color: #54d854;
}

ul.light-list {
  list-style: none;
  padding: 0;
}

.edit-group-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  max-width: 400px;
  margin: 0 auto;
  margin-top: 20px;
}

.edit-group-section button {
  margin: 5px;
  padding: 15px 20px;
  font-size: 18px;
  cursor: pointer;
  width: 180px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
}

.edit-group-section button:hover {
  background-color: #0056b3;
}

.edit-group-section button:active {
  background-color: #004080;
}

.rename-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.switch {
  margin-top: 10px;
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.modalSearching {
  display: block;
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  background-color: rgba(0,0,0,0.8);
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  p {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
  }
}

.light-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.slider-container {
  margin-top: 10px;
}

input[type="range"].temperature-slider{
  &::-webkit-slider-runnable-track {
    background: linear-gradient(to right, rgb(67, 67, 250), rgb(255, 255, 255), rgb(255, 230, 0));
    border: 2px solid transparent;
    border-radius: 15px;
  }

  &::-moz-range-track {
    background: linear-gradient(to right, rgb(67, 67, 250), rgb(255, 255, 255), rgb(255, 230, 0));
    border: 2px solid transparent;
    border-radius: 15px;
  }
}

input[type="range"].brightness-slider {
  &::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #000, #d1d0d0, #fff);
    border: 2px solid transparent;
    border-radius: 15px;
  }

  &::-moz-range-track {
    background: linear-gradient(to right, #000, #d1d0d0, #fff);
    border: 2px solid transparent;
    border-radius: 15px;
  }
}

</style>
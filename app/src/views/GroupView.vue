<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GroupAttributes } from '@/types/GroupAttributes';
import axios from 'axios';
import Light from '@/types/Light';
import TopBar from '@/components/TopBar.vue';

const router = useRouter();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const group = ref<GroupAttributes>();
const lights = ref<Light[]>([]);
const selectedTab = ref('lights');
const renameDialogOpen = ref(false);
const newGroupName = ref('');

onMounted(() => {
    getGroup();
});

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
        lights.value.push(lightData);
        console.log('Light data: ', lightData);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const showLights = () => {
  selectedTab.value = 'lights';
}

const showScenes = () => {
  selectedTab.value = 'scenes';
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
    <button @click="showScenes">Show Scenes</button>
    <button @click="editGroup">Edit Group</button>

    <!-- dialogue pour rename le groupe -->
    <div v-if="renameDialogOpen" class="rename-dialog">
      <input v-model="newGroupName" type="text" placeholder="Enter new group name" />
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

          <!-- toggle switch pour eteindre/allumer les lampes -->
          <label class="switch">
            <input type="checkbox" v-model="light.state.on" @change="toggleLight(light)">
            <span class="slider"></span>
          </label>

        </li>
      </ul>
    </div>


    <!-- pour montrer les scenes -->
    <div v-if="selectedTab === 'scenes'">
      <ul class="scene-list">
        <li v-for="scene in group?.scenes" :key="scene.id" class="scene-item">
          <div class="scene-info">
            <p class="item-name">{{ scene.name }}</p>
            <p>Scene ID: {{ scene.id }}</p>
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
        
    </div>

  </div>
    
</template>

<style scoped>

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

.item-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
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

.scene-list {
  list-style: none;
  padding: 0;
}

.scene-item {
  border: 1px solid #ddd;
  margin: 5px 0;
  padding: 10px;
}

.scene-info {
  display: flex;
  justify-content: space-between;
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

</style>
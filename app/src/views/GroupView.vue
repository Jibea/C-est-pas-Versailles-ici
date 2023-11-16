<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GroupAttributes } from '@/types/GroupAttributes';
import axios from 'axios';
import Light from '@/types/Light';

const gatewayIP = '127.17.0.2'
const APIKey = "key";
const router = useRouter();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const group = ref<GroupAttributes>();
const lights = ref<Light[]>([]);
const selectedTab = ref('lights');

onMounted(() => {
    getGroup();
});

const getGroup = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
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
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/lights/${lightId}`);
        const lightData = response.data;
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

</script>

<template>

  <div class="group-view">
    <h1>{{ group?.name }}</h1>
    <p class="group-id">Group ID: {{ group?.id }}</p>

    <button @click="showLights">Show Lights</button>
    <button @click="showScenes">Show Scenes</button>
    <button @click="editGroup">Edit Group</button>

    <!-- pour montrer les lights -->
    <div v-if="selectedTab === 'lights'">
      <ul class="light-list">
        <li v-for="light in lights" :key="light.id" class="light-item">
          <div class="light-info">
            <p class="item-name">{{ light.name }}</p>
            <p class="light-state">{{ light.state.on ? 'On' : 'Off' }}</p>
            <p class="light-manufacturer">Manufacturer: {{ light.manufacturername }}</p>
          </div>
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
      <button>Scene Editor</button>
      <button>Manage Lights</button>
      <button>Schedule</button>
      <button>Sensor Control</button>
    </div>

  </div>
    
</template>

<style scoped>
.group-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

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
  flex-direction: row;
  justify-content: space-around;
  margin-top: 20px;
}

.edit-group-section button {
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

</style>
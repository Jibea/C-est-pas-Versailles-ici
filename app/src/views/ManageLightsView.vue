<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { GroupAttributes } from '@/types/GroupAttributes';
import { Light } from '@/types/Light';

const gatewayIP = '127.17.0.2'
const APIKey = "key";
const router = useRouter();
const group = ref<GroupAttributes>();
const lights = ref<Light[]>([]);
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);

onMounted(() => {
    getGroup();
});

const getGroup = async () => {
  try {
        lights.value = [];
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

const removeLight = async (lightId: string) => {
    try {
        const response = await axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/lights/${lightId}`);
        console.log('Light removed: ', response.data);
        await getGroup();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

</script>

<template>
  <div class="room-view">
    <h1>Manage Lights View</h1>

    <ul class="light-list">
      <li v-for="light in lights" :key="light.id" class="light-item">
        <div class="light-info">
          <p class="light-name">{{ light.name }}</p>
          <p class="light-state">{{ light.state.on ? 'On' : 'Off' }}</p>
          <p class="light-manufacturer">Manufacturer: {{ light.manufacturername }}</p>
          <p class="light-manufacturer">Model: {{ light.modelid }}</p>
          <p class="light-manufacturer">Unique ID: {{ light.uniqueid }}</p>
        </div>
        <button @click="removeLight(light.id)">Remove</button>
      </li>
    </ul>

  </div>
</template>

<style scoped>

.room-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.light-list {
  list-style: none;
  padding: 0;
}

.light-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  cursor: pointer;
  padding: 8px 12px;
  background-color: #f31616;
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

.light-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

</style>
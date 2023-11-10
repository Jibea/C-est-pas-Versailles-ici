<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GroupAttributes } from '@/types/GroupAttributes';
import axios from 'axios';
import Light from '@/types/Light';

const gatewayIP = '127.17.0.2'
const router = useRouter();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const group = ref<GroupAttributes>();
const lights = ref<Light[]>([]);

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

</script>

<template>

  <div class="group-view">
    <h1>{{ group?.name }}</h1>
    <p class="group-id">Group ID: {{ group?.id }}</p>
    <ul class="light-list">
      <li v-for="light in lights" :key="light.id" class="light-item">
        <div class="light-info">
          <p class="light-name">{{ light.name }}</p>
          <p class="light-state">{{ light.state.on ? 'On' : 'Off' }}</p>
          <p class="light-manufacturer">Manufacturer: {{ light.manufacturername }}</p>
        </div>
      </li>
    </ul>
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

.light-name {
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
</style>
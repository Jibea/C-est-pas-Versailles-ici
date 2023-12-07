<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import TopBar from '@/components/TopBar.vue';
import { Scene } from '@/types/Scene';

const router = useRouter();
const scenes: Scene[] = ref();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);

onMounted(() => {
    getScenes()

});

const getScenes = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}/scenes`);
        scenes.value = response.data;
        console.log('Group data: ', response.data);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

</script>

<template>
  <TopBar title="Edit Scene" />
  <ul class="scene-list">
    <li v-for="scene in scenes" :key="scene.name" class="scene-item">
      <div class="scene-info">
        <p class="item-name">{{ scene.name }}</p>
        <p>Scene ID: {{ scene.transitiontime }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>

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

.item-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

</style>
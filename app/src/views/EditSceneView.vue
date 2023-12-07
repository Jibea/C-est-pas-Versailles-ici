<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import TopBar from '@/components/TopBar.vue';
import { Scene } from '@/types/Scene';
import { SceneAttributes } from '@/types/SceneAttributes';

const router = useRouter();
const scenes = ref<Scene>({});
const indexClicked = ref(0);
const sceneInfos = ref<SceneAttributes>({
  lights: [],
  name: "",
  state: 0,
});
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);

onMounted(() => {
    getScenes()
});

const getScenes = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}/scenes`);
        scenes.value = response.data;
        // console.log('scenes data: ', scenes.value[1].transitiontime);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const getSceneInfo = async (id: number) => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}/scenes/${id}`);
        sceneInfos.value = response.data;
        console.log('sceneInfos data: ', sceneInfos.value);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const clickedScene = async (index: number) => {
  if (indexClicked.value != index) {
    await getSceneInfo(index);
    indexClicked.value = index;
  } else {
    indexClicked.value = 0
  }
  console.log(`change index to ${indexClicked.value}`)
}

</script>

<template>
  <TopBar title="Edit Scene" />
  <ul class="scene-list">
    <li v-for="(scene, index) in scenes" :key="scene.name" >
      <button @click="clickedScene(index)" class="scene-button">
      <div class="scene-info">
        <p class="item-name">{{ scene.name }}</p>
      </div>
    </button>
    <div v-if="index == indexClicked">
      <p>cliked on {{ sceneInfos.name }} </p>
    </div>
    </li>
  </ul>
</template>

<style scoped>

.scene-list {
  list-style: none;
  padding: 0;
}

.scene-button {
  cursor: pointer;
  border: 1px solid #ddd;
  margin: 5px 0;
  padding: 10px;
  width: 40%;
  border-radius: 15px;
}

.scene-info {
  justify-content: space-between;
}

.item-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

</style>
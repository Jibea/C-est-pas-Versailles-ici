<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import TopBar from '@/components/TopBar.vue';
import { Scene } from '@/types/Scene';
import { SceneAttributes } from '@/types/SceneAttributes';
import SwitchOnOff from '@/components/SwitchOnOff.vue';
import BrightnessSlide from '@/components/BrightnessSlide.vue';
import ColorTemperatureSlide from '@/components/ColorTemperatureSlide.vue';

const router = useRouter();
const scenes = ref<Scene>({});
const addingScene = ref(false);
const indexClicked = ref(0);
const message = ref('');
const renameScene = ref('');
const indexClickedRename = ref(0);
const sceneInfos = ref<SceneAttributes>({
  lights: [],
  name: "",
  state: 0,
});
const renameDialogOpen = ref(false);
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const gatewayIP = process.env.VUE_APP_GATEWAY_IP
const APIKey = process.env.VUE_APP_API_KEY;

onMounted(() => {
    getScenes()
});

const openRenameDialog = (index: number) => {
  renameDialogOpen.value = !renameDialogOpen.value;
  if (renameDialogOpen.value)
    indexClickedRename.value = index;
  else
    indexClickedRename.value = 0;
}

const checkNameScene = (newname: string) => {
  const scenesName = Object.values(scenes.value).map(obj => {
    const { name } = obj;
    return { name };
  });
  for (let i = 0; i < scenesName.length; i++) {
    if (scenesName[i].name == newname) {
      return false;
    }
  }
  return true;
}

const getScenes = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes`);
        scenes.value = response.data;
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const getSceneInfo = async (id: number) => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${id}`);
        sceneInfos.value = response.data;
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
}

const addScene = async () => {
  try {
    await axios.post(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes`, {
        name: message.value,
    });
    await getScenes();
    stateScene();
  } catch (error) {
    console.error(`Error`);
  }
  message.value = '';
}

const editNameScene = async () => {
  try {
    await axios.put(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${indexClickedRename.value.toString()}`, {
        name: renameScene.value,
    });
    await getScenes();
    openRenameDialog(indexClickedRename.value);
  } catch (error) {
    console.error(`Error`);
  }
  renameScene.value = '';
}

const deleteScene = async (sceneId: string) => {
  try {
    await axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${sceneId}`);
    await getScenes();
  } catch (error) {
    console.error(`Error`);
  }
}

const stateScene = () => {
  addingScene.value = !addingScene.value;
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
      <font-awesome-icon
        :icon="['fas', 'pen']"
        style="color: #706d74; cursor: pointer; margin-left: 10px;"
        @click="openRenameDialog(index)"
      />
      <font-awesome-icon @click="deleteScene(index.toString())" icon="trash" />
      <div v-if="renameDialogOpen" class="scene-input-rename-div">
        <input v-model="renameScene" placeholder="Scene name" maxlength="16" />
        <button v-if="checkNameScene(renameScene)" @click="editNameScene" >Rename</button>
        <p v-else>Name already used</p>
      </div>
      <div v-if="index == indexClicked">
        <p>name: {{ sceneInfos.name }} </p>
        <li v-for="(light) in sceneInfos.lights" :key="light.id" >
          <p>{{ light }}</p>
          <SwitchOnOff type="light" :baseUrl="`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${index}/lights/${light.id}`"/>
          <BrightnessSlide :baseUrl="`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${index}/lights/${light.id}`" />
          <ColorTemperatureSlide :baseUrl="`http://${gatewayIP}/api/${APIKey}/groups/${groupId}/scenes/${index}/lights/${light.id}`" />
        </li> 
      </div>
    </li>
  </ul>
  <div v-if="addingScene == true" class="scene-input-div">
    <input v-model="message" placeholder="Scene name" maxlength="16" />
    <button v-if="checkNameScene(message)" @click="addScene" >Add</button>
    <p v-else>Name already used</p>
  </div>
  <button @click="stateScene" class="add-scene">
    <p class="add-scene-text">+</p>
  </button>
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

.add-scene {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-right: 2%;
  margin-bottom: 2%;
  display:block;
  height: 75px;
  width: 75px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.add-scene-text {
  font-size: 200%;
  font-weight: bold;
}

.scene-input-div {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-right: 2%;
  margin-bottom: 10%;
}

.scene-input-rename-div {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-right: 2%;
  margin-bottom: 12%;
}

</style>
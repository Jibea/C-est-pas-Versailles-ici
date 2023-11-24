<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { GroupAttributes } from '@/types/GroupAttributes';
import { LightsApiResponse } from '@/types/Light';
import { Light } from '@/types/Light';

const gatewayIP = '127.17.0.2'
const APIKey = "key";
const router = useRouter();
const group = ref<GroupAttributes>();
const lights = ref<string[]>([]);
const detailedLights = ref<Record<string, Light>>({});
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const allLights = ref<LightsApiResponse>();
const renameDialogOpen = ref(false);
const newLightName = ref('');
const lightIdToRename = ref();

onMounted(() => {
    getGroup();
    getAllLights().then((response) => {
        allLights.value = response;
    });
});

const getGroup = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        group.value = response.data;
        console.log('Group data: ', response.data);
        const lightsInGroupIds = group.value?.lights || [];
        await Promise.all(lightsInGroupIds.map((lightId: string) => getLight(lightId)));        
        lights.value = lightsInGroupIds;
    } catch (error) {
        console.error('Error API: ', error);
    }
};

const getLight = async (lightId: string) => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/lights/${lightId}`);
        const lightData = response.data;
        detailedLights.value = {
            ...detailedLights.value,
            [lightId]: lightData,
        };
        console.log('Light data: ', lightData);
    } catch (error) {
        console.error('Error API: ', error);
    }
};

const removeLight = async (lightId: string) => {
    try {
        const currentGroup = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        const groupAttributes = currentGroup.data;

        if (groupAttributes.lights) {
            groupAttributes.lights = groupAttributes.lights.filter((id: string) => id !== lightId);
            const response = await axios.put(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`, groupAttributes);
            console.log('Light removed from group. API Response:', response.data);
            await getGroup();
            await getAllLights().then((response) => {
                allLights.value = response;
            });
        } else {
            console.warn('No lights in the group to remove.');
        }
    } catch (error) {
        console.error('Error API: ', error);
    }
};

const getAllLights = async (): Promise<LightsApiResponse> => {
    try {
        const allLightsResponse = await axios.get(`http://${gatewayIP}/api/${APIKey}/lights`);
        const lightsInGroupIds = group.value?.lights || [];
        const lightsNotInGroup = Object.fromEntries(
            Object.entries(allLightsResponse.data)
                .filter(([lightId]) => !lightsInGroupIds.includes(lightId))
                .map(([lightId, lightData]) => [lightId, { ...lightData, id: lightId }])
        );

        return lightsNotInGroup;
    } catch (error) {
        console.error('Error API: ', error);
    }
};

const addLightToGroup = async (lightId: string) => {
    try {
        const currentGroup = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        const groupAttributes = currentGroup.data;

        if (!groupAttributes.lights) {
            groupAttributes.lights = [];
        }
        groupAttributes.lights.push(lightId);
        const response = await axios.put(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`, groupAttributes);
        console.log('Light added to group: ', response.data);
        await getGroup();
        await getAllLights().then((response) => {
            allLights.value = response;
        });
    } catch (error) {
        console.error('Error adding light to group: ', error.response || error.message || error);
    }
};

const renameLight = async (lightId: string, newName: string) => {
    console.log('Renaming light: ', lightId, newName);
    try {
        const response = await axios.put(
            `http://${gatewayIP}/api/${APIKey}/lights/${lightId}`,
            { name: newName }
        );
        console.log('Light renamed: ', response.data);

        renameDialogOpen.value = false;
        newLightName.value = '';
        await getGroup();
        await getAllLights().then((response) => {
            allLights.value = response;
        });
    } catch (error) {
        console.error('Error API: ', error);
    }
};

const openRenameDialog = (lightId: string) => {
    console.log('Opening rename dialog for light: ', lightId);
    renameDialogOpen.value = true;
    lightIdToRename.value = lightId;
};

const cancelRename = () => {
    renameDialogOpen.value = false;
    newLightName.value = '';
};

</script>

<template>
  <div class="room-view">
    <h1>Manage Lights View</h1>

    <div class="lights-in-group">
        <h1>Lights in the Group</h1>
        <ul class="light-list">
            <li v-for="lightId in lights" :key="lightId" class="light-item">
                <div class="light-info">
                    <p class="light-name">{{ detailedLights[lightId]?.name || 'Loading...' }}</p>
                    <p class="light-state">{{ detailedLights[lightId]?.state && detailedLights[lightId]?.state.on ? 'On' : 'Off' }}</p>
                    <p class="light-manufacturer">Manufacturer: {{ detailedLights[lightId]?.manufacturername || 'Loading...' }}</p>
                    <p class="light-manufacturer">Model: {{ detailedLights[lightId]?.modelid || 'Loading...' }}</p>
                    <p class="light-manufacturer">Unique ID: {{ detailedLights[lightId]?.uniqueid || 'Loading...' }}</p>
                </div>

                {{ lightId }}

                <button @click="removeLight(lightId)">Remove</button>
                <button @click="openRenameDialog(lightId)">Rename</button>

                <div v-if="renameDialogOpen" class="rename-dialog">
                    <label for="newLightName">Enter new name:</label>
                    <input v-model="newLightName" type="text" id="newLightName" class="rename-input"/>
                    <div class="button-container">
                        <button @click="renameLight(lightId, newLightName)">Confirm</button>
                        <button @click="cancelRename">Cancel</button>
                    </div>
                </div>
            </li>
        </ul>
    </div>

    <div class="all-lights">
        <h2>All Lights</h2>
        <ul class="light-list">
            <li v-for="(light, lightId) in allLights" :key="lightId" class="light-item">
                <div class="light-info">
                    <p class="light-name">{{ light.name }}</p>
                    <p class="light-state">{{ light.state.on ? 'On' : 'Off' }}</p>
                    <p class="light-manufacturer">Manufacturer: {{ light.manufacturername }}</p>
                    <p class="light-manufacturer">Model: {{ light.modelid }}</p>
                    <p class="light-manufacturer">Unique ID: {{ light.uniqueid }}</p>
                </div>

                {{ lightId }}

                <button @click="addLightToGroup(lightId)">Add to Group</button>
                <button @click="openRenameDialog(lightId)">Rename</button>

                <div v-if="renameDialogOpen" class="rename-dialog">
                    <label for="newLightName">Enter new name:</label>
                    <input v-model="newLightName" type="text" id="newLightName" class="rename-input"/>
                    <div class="button-container">
                        <button @click="renameLight(lightId, newLightName)">Confirm</button>
                        <button @click="cancelRename">Cancel</button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
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

.rename-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.rename-input {
  color: #333;
  border: 1px solid #ccc;
  padding: 2px;
  width: 50%;
}

.button-container {
  margin-left: 10px;
  justify-content: space-between;
  margin-top: 10px;
}

.button-container button {
  padding: 8px 16px;
  background-color: #f31616;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.button-container button:hover {
  background-color: #45a049;
}

.button-container button:last-child {
  margin-right: 10px;
}

.lights-in-group {
    background-color: #f1eeee;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 10px;
}

.all-lights {
    background-color:  #f1eeee;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
}

</style>
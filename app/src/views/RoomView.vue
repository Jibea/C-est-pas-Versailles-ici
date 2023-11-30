<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { GroupsResponse } from '@/types/GroupsResponse';
import { Group } from '@/types/Group';
import TopBar from '@/components/TopBar.vue';

const roomName = ref('');
const groups = ref<GroupsResponse>({});
const groupName = ref('');
const groupIdToggle = ref('');

onMounted(() => {
    const route = useRoute();
    roomName.value = route.params.roomName;

    getGroups();
});

const fixMessageSyntax = () => {
    groupName.value = groupName.value.replaceAll("-", " ")
    const separate = groupName.value.split(" ")
    groupName.value = ""
    for (let i = 0; i < separate.length - 1; i++) {
        if (separate[i].length > 0)
            groupName.value += separate[i] + " "
    }
    if (separate[separate.length - 1].length > 0)
    groupName.value += separate[separate.length - 1]
}

const getGroups = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups`);
        groups.value = response.data;
        console.log('Groups data: ', groups.value);
        updateGroupStates();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const removeGroup = async (groupId: string) => {
    try {
        const response = await axios.delete(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}`);
        console.log('Response: ', response);
        getGroups();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const addGroup = async () => {
  try {
    groupName.value = roomName.value + "-" + groupName.value
    const response = await axios.post(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups`, {
      name: groupName.value,
    });
    console.log('Response: ', response);
    getGroups();
    groupName.value = '';
  } catch (error) {
    console.error('Error API: ', error);
  }
};

const filteredGroups = computed(() => {
  const normalizedRoomName = roomName.value.toLowerCase();

  return Object.entries(groups.value).filter(([groupId, group]: [string, Group]) => {
    const normalizedGroupName = group.name.toLowerCase();
    return normalizedGroupName.startsWith(`${normalizedRoomName}-`);
  });
});

const updateGroupStates = async () => {
    for (const [groupId, group] of Object.entries(groups.value)) {
        try {
            const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}`);
            console.log('Response dallumage:', response.data.action.on);
            groups.value[groupId].isOn = response.data.action.on;
        } catch (error) {
            console.error('Error updating group state:', error);
        }
    }
    console.log('Updated groups:', groups.value);
};

const toggleGroup = async (groupId: string) => {
    try {
        const currentGroup = groups.value[groupId];
        if (!currentGroup) {
            console.error('Group not found:', groupId);
            return;
        }
        const newState = !currentGroup.isOn;
        groupIdToggle.value = groupId;
        let payload = { on: newState };
        const response = await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups/${groupId}/action`, payload);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error API:', error);
    } finally {
        groupIdToggle.value = '';
        await getGroups();
    }
};

</script>

<template>
  <div>
    <TopBar :title="roomName" />
  </div>
  <div class="room-view">
    <h1>Room View</h1>
    <p class="room-name">Room name: {{ roomName }}</p>

    <section class="group-section">
      <h2>Groups</h2>

      <ul class="group-list">
        <li v-for="([groupId, group]) in filteredGroups" :key="groupId" class="group-item">

          <router-link :to="{ name: 'groupRoute', params: { groupId: groupId, roomName: roomName } }">
            <span class="group-name">{{ group.name }}</span>
          </router-link>
    
        <div class="group-controls">
          <button @click="removeGroup(groupId)" class="remove-button">Remove</button>

          <label class="switch">
            <input type="checkbox" @change="toggleGroup(groupId)" :checked="group.isOn" :disabled="groupIdToggle === groupId">
            <span class="slider"></span>
          </label>
        </div>

        </li>
      </ul>

    </section>
    
    <section class="add-group-section">
      <input v-model="groupName" type="text" placeholder="Enter group name" class="group-input" maxlength="16" v-on:input="fixMessageSyntax"/>
      <button @click="addGroup" class="add-button">Add</button>
    </section>

  </div>
</template>

<style scoped>
.room-view {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.room-name {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.group-section {
  margin-bottom: 20px;
}

.group-list {
  list-style-type: none;
  padding: 0;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px;
}

.group-name {
  flex-grow: 1;
}

.remove-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.add-group-section {
  display: flex;
  gap: 10px;
}

.group-input {
  flex-grow: 1;
  padding: 8px;
}

.add-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
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

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.group-controls {
  display: flex;
  gap: 10px;
}

</style>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { GroupsResponse } from '@/types/GroupsResponse';
import { Group } from '@/types/Group';
import TopBar from '@/components/TopBar.vue';
import SwitchOnOff from '@/components/SwitchOnOff.vue';

const roomName = ref('');
const groups = ref<GroupsResponse>({});
const groupName = ref('');
const gatewayIP = process.env.VUE_APP_GATEWAY_IP
const APIKey = process.env.VUE_APP_API_KEY;

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
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups`);
        groups.value = response.data;
        updateGroupStates();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const removeGroup = async (groupId: string) => {
    try {
        await axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        getGroups();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const addGroup = async () => {
  try {
    groupName.value = roomName.value + "-" + groupName.value
    await axios.post(`http://${gatewayIP}/api/${APIKey}/groups`, {
      name: groupName.value,
    });
    getGroups();
    groupName.value = '';
  } catch (error) {
    console.error('Error API: ', error);
  }
};

const filteredGroups = computed(() => {
  const normalizedRoomName = roomName.value.toLowerCase();

  return Object.entries(groups.value).filter(([_, group]: [string, Group]) => {
    const normalizedGroupName = group.name.toLowerCase();
    return normalizedGroupName.startsWith(`${normalizedRoomName}-`);
  });
});

const updateGroupStates = async () => {
    for (const [groupId, _] of Object.entries(groups.value)) {
        try {
            const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
            groups.value[groupId].isOn = response.data.action.on;
        } catch (error) {
            console.error('Error updating group state:', error);
        }
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
          <SwitchOnOff type="group" :baseUrl="`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`"/>

          <!-- <label class="switch">
            <input type="checkbox" @change="toggleGroup(groupId)" :checked="group.isOn" :disabled="groupIdToggle === groupId">
            <span class="slider"></span>
          </label> -->
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

.group-controls {
  display: flex;
  gap: 10px;
}

</style>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { GroupsResponse } from '@/types/GroupsResponse';
import { Group } from '@/types/Group';

const roomName = ref('');
const gatewayIP = '127.17.0.2'
const APIKey = "key";
const groups = ref<GroupsResponse>({});
const groupName = ref('');

onMounted(() => {
    const route = useRoute();
    roomName.value = route.params.roomName;

    getGroups();
});

const getGroups = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups`);
        groups.value = response.data;
        console.log('Groups data: ', groups.value);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const removeGroup = async (groupId: string) => {
    try {
        const response = await axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        console.log('Response: ', response);
        getGroups();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

const addGroup = async () => {
  try {
    const response = await axios.post(`http://${gatewayIP}/api/${APIKey}/groups`, {
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

</script>

<template>
  <div class="room-view">
    <h1>Room View</h1>
    <p class="room-name">Room name: {{ roomName }}</p>
    
    <section class="group-section">
      <h2>Groups</h2>

      <ul class="group-list">
        <li v-for="([groupId, group]) in filteredGroups" :key="groupId" class="group-item">

          <router-link :to="{ name: 'groupRoute', params: { groupId: groupId } }">
            <span class="group-name">{{ group.name }}</span>
          </router-link>
    
          <button @click="removeGroup(groupId)" class="remove-button">Remove</button>

        </li>
      </ul>

    </section>
    
    <section class="add-group-section">
      <input v-model="groupName" type="text" placeholder="Enter group name" class="group-input" />
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
</style>
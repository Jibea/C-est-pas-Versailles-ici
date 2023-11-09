<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { GroupsResponse } from '@/types/GroupsResponse';

const roomName = ref('');
const gatewayIP = '127.17.0.2'
const groups = ref<GroupsResponse>({});

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

const addGroup = async (groupName: string) => {
    try {
        const response = await axios.post(`http://${gatewayIP}/api/${APIKey}/groups`, {
            name: groupName
        });
        console.log('Response: ', response);
        getGroups();
    } catch (error) {
        console.error('Error API: ', error);
    }
}

</script>

<template>
  <div>
    <h1>Room View</h1>
    <p>Room name: {{ roomName }}</p>
    <h2>Groups</h2>
    <ul>
      <li v-for="(group, groupId) in groups" :key="groupId" class="group-item">
        {{ group.name }}
        <button @click="removeGroup(groupId)">Remove</button>
      </li>
    </ul>
    <input type="text" v-model="groupName" />
    <button @click="addGroup(groupName)">Add</button>
  </div>
</template>

<style scoped>
.group-item {
    list-style-type: none;
    margin-bottom: 8px;
}
</style>
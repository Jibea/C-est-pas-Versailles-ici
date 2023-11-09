<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Group } from '@/types/Groups';

const roomName = ref('');
const gatewayIP = '127.17.0.2'

const groups = ref<Group[]>([]);

onMounted(() => {
    const route = useRoute();
    roomName.value = route.params.roomName;

    getGroups();
});

const getGroups = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups`);
        groups.value = response.data;
        console.log(response.data);
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
            <li v-for="group in groups" :key="group.id" class="group-item">
                {{ group.name }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.group-item {
    list-style-type: none;
    margin-bottom: 8px;
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GroupAttributes } from '@/types/GroupAttributes';
import axios from 'axios';

const gatewayIP = '127.17.0.2'
const router = useRouter();
const groupId = decodeURIComponent(router.currentRoute.value.params.groupId);
const group = ref<GroupAttributes>();

onMounted(() => {
    getGroup();
});

const getGroup = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`);
        group.value = response.data;
        console.log('Group data: ', response.data);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

</script>

<template>

    <div>
        <h1>Group: {{ group?.name }}</h1>
        <p>Group ID: {{ group?.id }}</p>
        <ul>
            <li v-for="light in group?.lights" :key="light">{{ light }}</li>
        </ul>
    </div>
    
</template>

<style scoped>

</style>
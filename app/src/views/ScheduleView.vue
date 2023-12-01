<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Schedule } from '@/types/Schedule';

const schedules = ref<Record<string, Schedule>>({});

onMounted(() => {
    const route = useRoute();
    getSchedule();
});

const getSchedule = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`);
        schedules.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

</script>

<template>
  <div class="room-view">
    <h1>Schedule View</h1>

    <ul>
      <li v-for="schedule in schedules" :key="schedule.id">
        {{ schedule.name  }} - {{ schedule.time  }}
      </li>
    </ul>

  </div>
</template>

<style scoped>

</style>
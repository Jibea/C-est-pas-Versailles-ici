<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Schedule } from '@/types/Schedule';

const schedules = ref<Record<string, Schedule>>({});
const currentGroupId = ref<string>('');

onMounted(() => {
    const route = useRoute();
    currentGroupId.value = route.params.groupId;
    getSchedule();
});

const getSchedule = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`);
        
        const filteredSchedules = Object.fromEntries(
            Object.entries(response.data).filter(([key, schedule]: [string, unknown]) => {
                const typeSchedule = schedule as Schedule;
                return typeSchedule.command.address.includes(`/groups/${currentGroupId.value}/`);
            })
        );

        schedules.value = filteredSchedules;
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
        {{ schedule.name }} - {{ schedule.time }}
      </li>
    </ul>

  </div>
</template>

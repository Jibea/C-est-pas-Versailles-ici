<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { Schedule } from '@/types/Schedule';
import TopBar from '@/components/TopBar.vue';

const schedules = ref<Record<string, Schedule>>({});
const currentGroupId = ref<string>('');
const selectedSchedule = ref<Schedule | null>(null);

onMounted(() => {
    const route = useRoute();
    currentGroupId.value = route.params.groupId;
    getSchedule();
});

const getSchedule = async () => {
  try {
    const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/schedules`);
    console.log('All Schedules:', response.data);
    const filteredSchedules: Schedule[] = [];

    Object.entries(response.data).forEach(([key, schedule]: [string, unknown]) => {
      const typeSchedule = schedule as Schedule;
      if (typeSchedule.command.address.includes(`/groups/${currentGroupId.value}/`)) {

        typeSchedule.id = key;
        filteredSchedules.push(typeSchedule);
      }
    });

    console.log('Filtered Schedules:', filteredSchedules);

    schedules.value = filteredSchedules;
  } catch (error) {
    console.error(error);
  }
};

const showDetails = (scheduleId: string) => {
  console.log('Clicked on scheduleId:', scheduleId);

  if (scheduleId !== undefined) {
    const schedule = schedules.value[scheduleId];
    console.log('Schedule object:', schedule);

    if (schedule) {
      selectedSchedule.value = schedule;
      console.log(`Show details for schedule ${scheduleId}`);
    } else {
      console.error(`Schedule with id ${scheduleId} not found`);
    }
  } else {
    console.error('Undefined scheduleId');
  }
};


const modifySchedule = (scheduleId: string) => {
  console.log(`Modify schedule ${scheduleId}`);
}

</script>

<template>
  <div>
    <TopBar :title="'Schedule View'" />
  </div>

  <div class="room-view">

    <ul>
      <li v-for="schedule in schedules" :key="schedule.id">
        {{ schedule.name }} - {{ schedule.time }}
        <button @click="showDetails(schedule.id)">Show Details (ID: {{ schedule.id }})</button>
      </li>
    </ul>

    <div v-if="selectedSchedule">
      <h2 v-if="selectedSchedule.id">{{ selectedSchedule.name }} Details</h2>
      <p v-if="selectedSchedule.id">Description: {{ selectedSchedule.description }}</p>
      <p v-if="selectedSchedule.id">Time: {{ selectedSchedule.time }}</p>

      <button v-if="selectedSchedule.id" @click="modifySchedule(selectedSchedule.id)">Modify Schedule</button>
    </div>

  </div>
</template>

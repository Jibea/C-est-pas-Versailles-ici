<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

onMounted(() => {
    useRoute();
});

</script>

<template>
  <div class="room-view">
    <h1>Sensor Control View</h1>
  </div>
</template>

<style scoped>

</style>
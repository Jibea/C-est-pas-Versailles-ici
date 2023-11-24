<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

onMounted(() => {
    const route = useRoute();

});

</script>

<template>
  <div class="room-view">
    <h1>Schedule View</h1>
  </div>
</template>

<style scoped>

</style>
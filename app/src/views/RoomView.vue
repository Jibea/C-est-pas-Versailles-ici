<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const roomName = ref('');

onMounted(() => {
    const route = useRoute();
    roomName.value = route.params.roomName;
});

</script>

<template>
    <div>
        <h1>Room View</h1>
        <p>Room name: {{ roomName }}</p>
    </div>
</template>

<style scoped>

</style>
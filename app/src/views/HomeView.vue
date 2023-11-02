
<script lang="ts" setup name="HomeView">
    import { ref } from 'vue';
    import TopBar from '@/components/TopBar.vue';
    import RoomButton from '@/components/RoomButton.vue';
    import draggable from 'vuedraggable'
const meals = ref([
  'Hamburger',
  'Pizza',
  'Spaghetti',
  'Tacos',
  'Teriyaki Chicken',
]);
</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="meals" :animation="300" >
        <template #item="{ element: meal }">
            <RoomButton  :roomName="meal" ></RoomButton>
        </template>
    </draggable>
</template>

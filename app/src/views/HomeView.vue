
<script lang="ts" setup name="HomeView">
    import { ref } from 'vue';
    import TopBar from '@/components/TopBar.vue';
    import RoomButton from '@/components/RoomButton.vue';
    import draggable from 'vuedraggable'
const rooms = ref([
  {name: 'Hamburger', lights: false},
  {name: 'Pizza', lights: false},
  {name: 'Spaghetti', lights: true},
  {name: 'Tacos', lights: false},
  {name: 'Teriyaki Chicken', lights: false}
]);
</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="rooms" :animation="300" >
        <template #item="{ element: room }">
            <RoomButton  :roomName="room.name" :lampsLit="room.lights" ></RoomButton>
        </template>
    </draggable>
</template>

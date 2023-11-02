
<script lang="ts" setup name="HomeView">
    import { ref, onMounted, onBeforeUnmount } from "vue";
    import TopBar from '@/components/TopBar.vue';
    import RoomButton from '@/components/RoomButton.vue';
    import draggable from 'vuedraggable'
const rooms = ref([
    {name: 'Poudlard', lights: false},
    {name: 'Vogons', lights: false},
    {name: 'Gotham', lights: true},
]);
onMounted(() => {
    const savedList = localStorage.getItem("draggable-list");
    if (savedList) {
        rooms.value = JSON.parse(savedList);
    }
});
function onSave() {
    localStorage.setItem("draggable-list", JSON.stringify(rooms.value));
}
</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="rooms" :animation="300">
        <template #item="{ element: room }">
            <RoomButton  :roomName="room.name" :lampsLit="room.lights" ></RoomButton>
        </template>
    </draggable>
    <button @click="onSave">Save</button>
</template>

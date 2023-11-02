
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
let isInput = ref(false);
let message = ref("");

onMounted(() => {
    // TODO get tous les groupes des rooms dans l'api
    const savedList = localStorage.getItem("draggable-list");
    if (savedList) {
        rooms.value = JSON.parse(savedList);
    }
});
const onSave = () => {
    // TODO save in api new group of room
    localStorage.setItem("draggable-list", JSON.stringify(rooms.value));
}

const addRoom = () => {
    const newRoom = message.value
    const newItem = { name: newRoom, lights: false };
    rooms.value.push(newItem);
}
const changeMod = () => {
    if (isInput.value) {
        isInput.value = false
    } else {
        isInput.value = true
        message.value = ""
        onSave()
    }
}
</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="rooms" :animation="300">
        <template #item="{ element: room }">
            <RoomButton  :roomName="room.name" :lampsLit="room.lights" ></RoomButton>
        </template>
    </draggable>
    <button @click="changeMod">Edit mode</button>
    <div v-if="isInput">
        <input v-model="message" placeholder="edit me"/>
        <button @click="addRoom">Add a room</button>
        <button @click="onSave">Save</button>
    </div>
</template>

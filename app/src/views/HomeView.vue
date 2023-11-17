
<script lang="ts" setup name="HomeView">
    import { ref, onMounted } from "vue";
    import TopBar from '@/components/TopBar.vue';
    import RoomButton from '@/components/RoomButton.vue';
    import draggable from 'vuedraggable'

const rooms = ref();
let isEdit = ref(false);
const message = ref("");

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
    if (isEdit.value) {
        isEdit.value = false
        onSave()
    } else {
        isEdit.value = true
        message.value = ""
    }
}

const onDragStart = (event) => {
    if (!isEdit.value) {
        event.preventDefault();
    }
}

const onClickRemove = (value) => {
    const roomIndex = rooms.value.findIndex(room => room.name === value);

    if (roomIndex !== -1) {
        rooms.value.splice(roomIndex, 1);
        localStorage.setItem("draggable-list", JSON.stringify(rooms.value));
    }
}

</script>

<template>
    <TopBar :title="title"/>
    <draggable v-model="rooms" :animation="300" @dragstart="onDragStart">
        <template #item="{ element: room }">
            <RoomButton @remove="onClickRemove"  :roomName="room.name" :lampsLit="room.lights" ></RoomButton>
        </template>
    </draggable>
    <button v-if="$route.path === '/aymeric'" @click="changeMod">Edit mode</button>
    <div v-if="isEdit">
        <input v-model="message" placeholder="Name of new room"/>
        <button @click="addRoom">Add a room</button>
    </div>
</template>

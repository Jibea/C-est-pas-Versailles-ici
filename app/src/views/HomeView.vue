
<script lang="ts" setup name="HomeView">
    import { ref, onMounted } from "vue";
    import { useRoute } from "vue-router";
    import TopBar from '@/components/TopBar.vue';
    import RoomButton from '@/components/RoomButton.vue';
    import draggable from 'vuedraggable'
    import axios from "axios";
    import { Group } from "@/types/Group";

const rooms = ref([]);
const route = useRoute();
let isEdit = ref(false);
const message = ref("");
const gatewayIP = process.env.VUE_APP_GATEWAY_IP
const APIKey = process.env.VUE_APP_API_KEY;
const groups = ref();
// fait une map avec le nom de la groupe et son id pour pouvoir le supprimer
const groupsMap = ref();

const getGroups = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups`);
        groupsMap.value = Object.entries(response.data).map(([groupId, group]: [string, Group]) => {
            const name = group.name;
            return { name, groupId };
        });
        groups.value = response.data;
        console.log('Groups data: ', groups.value);
    } catch (error) {
        console.error('Error API: ', error);
    }
}


const setupAdmin = async (savedList:any) => {
    await getGroups();
    console.log(groups.value)
    savedList.value =  groups.value;
    const result = Object.values(savedList.value).map(obj => {
        const { name, state: { all_on } } = obj;
        return { name, all_on };
    });
    localStorage.setItem("draggable-list", JSON.stringify(result));
    if (savedList.value) {
        rooms.value = result;
    }
    if (localStorage.getItem("draggable-list")) {
        rooms.value = JSON.parse(localStorage.getItem("draggable-list"));
        console.log(rooms.value)
    }
}

onMounted(() => {
    // TODO get tous les groupes des rooms dans l'api
    const savedList = ref()
    setupAdmin(savedList)
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

const addRoomAdmin = () => {
    axios.post(`http://${gatewayIP}/api/${APIKey}/groups`, {
        name: message.value,
    })
        .then((response) => {
            console.log(response);
            window.location.reload();
        }, (error) => {
            console.log(error);
        });
}

const changeMod = () => {
    if (isEdit.value) {
        isEdit.value = false
        if (route.path !== '/aymeric') {
            onSave()
        }
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

const onClickRemoveAdmin = (value) => {
    console.log(value)
    const index = groupsMap.value.findIndex(room => room.name === value)
    const groupId = groupsMap.value[index].groupId
    axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`)
        .then((response) => {
            console.log(response);
            window.location.reload();
        }, (error) => {
            console.log(error);
        });
}

</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="rooms" :animation="300" @dragstart="onDragStart">
        <template #item="{ element: room }">
            <RoomButton v-if="$route.path === '/aymeric'" @remove="onClickRemoveAdmin"  :roomName="room.name" :lampsLit="room.lights" :admin="true"></RoomButton>
            <RoomButton v-else  :roomName="room.name" :lampsLit="room.lights" :admin="false"></RoomButton>
        </template>
    </draggable>
    <button v-if="$route.path === '/aymeric'" @click="changeMod">Edit mode</button>
    <div v-if="isEdit">
        <input v-model="message" placeholder="Name of new room"/>
        <button v-if="$route.path === '/aymeric'" @click="addRoomAdmin">Add a room</button>
        <button v-else @click="addRoom">Add a room</button>
    </div>
</template>

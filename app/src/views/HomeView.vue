
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
let message = ref("");
const gatewayIP = process.env.VUE_APP_GATEWAY_IP
const hiddenPath = process.env.VUE_APP_HIDDEN_PATH
const APIKey = process.env.VUE_APP_API_KEY;
const groups = ref();
const groupsMap = ref();

const getGroups = async () => {
    try {
        const response = await axios.get(`http://${gatewayIP}/api/${APIKey}/groups`);
        groupsMap.value = Object.entries(response.data).map(([groupId, group]: [string, Group]) => {
            const name = group.name;
            return { name, groupId };
        });
        groupsMap.value = groupsMap.value.filter(group => !group.name.includes('-'));
        groups.value = response.data;
        return 0
    } catch (error) {
        console.error('Error API: ', error);
        return 1
    }
}


const setupAdmin = async (savedList: any) => {
    const api = await getGroups();
    if (api == 0) {
        savedList.value = groups.value;
        const result = ref(Object.values(savedList.value).map(obj => {
            const { name, state: { all_on } } = obj;
            return { name, all_on };
        }));
        result.value = result.value.filter(room => !room.name.includes('-'));
        localStorage.setItem("draggable-list", JSON.stringify(result.value));
        if (savedList.value) {
            rooms.value = result.value;
        }
        if (localStorage.getItem("draggable-list")) {
            rooms.value = JSON.parse(localStorage.getItem("draggable-list"));
        }
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

const fixMessageSyntax = () => {
    message.value = message.value.replaceAll("-", " ")
    const separate = message.value.split(" ")
    message.value = ""
    for (let i = 0; i < separate.length - 1; i++) {
        if (separate[i].length > 0)
            message.value += separate[i] + " "
    }
    if (separate[separate.length - 1].length > 0)
    message.value += separate[separate.length - 1]
}

const addRoomAdmin = () => {
    axios.post(`http://${gatewayIP}/api/${APIKey}/groups`, {
        name: message.value,
    })
    .then(_ => {
        window.location.reload();
    })
    .catch(error => {
        console.error('Error adding room:', error);
    });
}

const changeMod = () => {
    if (isEdit.value) {
        isEdit.value = false
        if (route.path !== `/${process.env.VUE_APP_HIDDEN_PATH}`) {
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
    const index = groupsMap.value.findIndex(room => room.name === value)
    const groupId = groupsMap.value[index].groupId
    axios.delete(`http://${gatewayIP}/api/${APIKey}/groups/${groupId}`)
    .then(_ => {
        window.location.reload();
    })
    .catch(error => {
        console.error(error);
    });
}

</script>

<template>
    <TopBar title="Home"/>
    <draggable v-model="rooms" :animation="300" @dragstart="onDragStart">
        <template #item="{ element: room }">
            <RoomButton v-if="$route.path === '/' + hiddenPath" @remove="onClickRemoveAdmin"  :roomName="room.name" :lampsLit="room.lights" :admin="true"></RoomButton>
            <RoomButton v-else  :roomName="room.name" :lampsLit="room.lights" :admin="false"></RoomButton>
        </template>
    </draggable>
    <button v-if="$route.path === '/' + hiddenPath " @click="changeMod">Edit mode</button>
    <div v-if="isEdit">
        <input v-model="message" placeholder="Name of new room" maxlength="16" v-on:input="fixMessageSyntax"/>
        <button v-if="$route.path === '/' + hiddenPath" @click="addRoomAdmin">Add a room</button>
        <button v-else @click="addRoom">Add a room</button>
    </div>
</template>

<script setup lang="ts" name="SwitchOnOff">
import { ref, onMounted, defineProps, watch } from 'vue';
import axios from 'axios';

const isSwitchOnOff = ref(false);
const isLightOn = ref(false);
const type = ref('');
const groupState = ref(false);
const baseUrl = ref('');

const props = defineProps({
    type: {
        type: String,
        required: true
    },
    baseUrl: {
        type: String,
        required: true
    },
});

watch(isSwitchOnOff, (newState) => {
    console.log('isSwitchOnOff:', newState);
    isSwitchOnOff.value = newState;
});

watch(isLightOn, (newState) => {
    console.log('isLightOn:', newState);
    isLightOn.value = newState;
});

watch(groupState, (newState) => {
    console.log('groupState:', newState);
    groupState.value = newState;
});


const getGroup = () => {
    axios.get(baseUrl.value)
        .then(response => {
            groupState.value = response.data.state.any_on;
            isSwitchOnOff.value = response.data.state.any_on;
        })
        .catch(error => {
            console.error('Error updating group state:', error);
        });
}

const getLight = () => {
    axios.get(baseUrl.value)
        .then(response => {
            console.log('[switch on off]state on/off:', response.data.state.on);
            isLightOn.value = response.data.state.on;
            isSwitchOnOff.value = response.data.state.on;
        })
        .catch(error => {
            console.error('Error updating light state:', error);
        });
}

onMounted(() => {
    type.value = props.type;
    baseUrl.value = props.baseUrl;
    if (type.value == 'group') {
        getGroup();
    } else if (type.value == 'light') {
        getLight();
    }

});

const SwitchOnOffFunction = () => {
    let body = { on: isSwitchOnOff.value };

    if (type.value == 'group') {
        axios.put(baseUrl.value + `/action`, body)
        .then(response => {
            console.log('Response:', response);
        })
        .catch(error => {
            console.error('Error API:', error);
        });
    }
    if (type.value == 'light') {
        axios.put(baseUrl.value + `/state`, body)
        .then(response => {
            console.log('Response:', response);
        })
        .catch(error => {
            console.error('Error API:', error);
        });
    }
}

</script>

<template>
    <div class="isSwitchOnOff" objectId type>
        <label class="switch">
            <input type="checkbox" @change="SwitchOnOffFunction" v-model="isSwitchOnOff" >
            <span class="slider"></span>
        </label>
    </div>
</template>

<style scoped>
.switch {
 font-size: 1rem;
 position: relative;
 display: inline-block;
 width: 4em;
 height: 2em;
 margin-top: 10px;
}

/* Hide default HTML checkbox */
.switch input {
 opacity: 0;
 width: 0;
 height: 0;
}

/* The slider */
.slider {
 position: absolute;
 cursor: pointer;
 inset: 0;
 background-color: #eee;
 transition: 0.4s;
 border-radius: 0.5em;
 box-shadow: 0 0.2em #dfd9d9;
}

.slider:before {
 position: absolute;
 content: "";
 height: 1.5em;
 width: 1.4em;
 border-radius: 0.3em;
 left: 0.3em;
 bottom: 0.7em;
 background-color: rgb(244, 51, 7);
 transition: 0.4s;
 box-shadow: 0 0.4em #bcb4b4;
}

.slider:hover::before {
 box-shadow: 0 0.2em #bcb4b4;
 bottom: 0.5em;
}

input:checked+.slider:before {
 transform: translateX(2em);
 background: rgb(9, 139, 209);
}



</style>
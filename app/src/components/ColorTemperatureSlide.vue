<script setup lang="ts">
import { defineProps, watch, } from 'vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Light } from '@/types/Light';

const light = ref<Light>();
const lightId = ref('');
const ColorTemp = ref(0);
const lightHasCt = ref(true);


const props = defineProps({
    lightId: {
      type: String,
      required: true,
    },
});

const getLightState = async () => {
    try {
        const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${props.lightId}`);
        light.value = response.data;
        if (light.value?.state.ct) {
          ColorTemp.value = light.value.state.ct;
        } else {
          lightHasCt.value = false;
        }
        console.log('ColorTemp data: ', ColorTemp.value);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

watch(ColorTemp, (newValue) => {
    console.log('ColorTemp changed: ', newValue);
    ColorTemp.value = newValue;
});

onMounted(() => {
  lightId.value = props.lightId;
  console.log('Light ID: ', props.lightId);
  getLightState();
});


const updateLightState = async () => {
    const validTemperature = Math.min(light.value?.ctmax, Math.max(light.value?.ctmin, ColorTemp.value));

    try {
        const response = await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${props.lightId}/state`, {
            ct: validTemperature,
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error API: ', error);
    }
}
</script>

<template>
<div class="ColorTemperatureSlide">
    <div class="slider-container">
        <label>Temperature: {{ ColorTemp }}</label>
        <input type="range" min="153" max="370" v-model="ColorTemp" @input="updateLightState()" class="temperature-slider"/>
    </div>
</div>
</template>


<style scoped>
.slider-container {
  margin-top: 10px;
}

input[type="range"].temperature-slider{
  &::-webkit-slider-runnable-track {
    background: linear-gradient(to right, rgb(67, 67, 250), rgb(255, 255, 255), rgb(255, 230, 0));
    border: 2px solid transparent;
    border-radius: 15px;
  }

  &::-moz-range-track {
    background: linear-gradient(to right, rgb(67, 67, 250), rgb(255, 255, 255), rgb(255, 230, 0));
    border: 2px solid transparent;
    border-radius: 15px;
  }
}
</style>
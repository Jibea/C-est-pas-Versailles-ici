<script setup lang="ts">
import { defineProps, watch, } from 'vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Light } from '@/types/Light';

const light = ref<Light>();
const lightId = ref('');
const brightness = ref(0);


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
        if (light.value?.state.bri) {
          brightness.value = light.value.state.bri;
        }
        console.log('brightness data: ', brightness.value);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

watch(brightness, (newValue) => {
    console.log('Brightness changed: ', newValue);
    brightness.value = newValue;
});

onMounted(() => {
  lightId.value = props.lightId;
  console.log('Light ID: ', props.lightId);
  getLightState();
});


const updateLightState = async () => {
    const validBrightness = Math.min(255, Math.max(0, brightness.value));
    try {
        const response = await axios.put(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/lights/${props.lightId}/state`, {
            bri: validBrightness,
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error API: ', error);
    }
}

</script>

<template>
    <div class="BrightnessSlide">
        <div class="slider-container">
          <label>Brightness: {{ brightness }}</label>
          <input type="range" min="0" max="255" v-model="brightness" @change="updateLightState()" class="brightness-slider"/>
        </div>
    </div>
</template>

<style scoped>
.slider-container {
  margin-top: 10px;
}

input[type="range"].brightness-slider {
  &::-webkit-slider-runnable-track {
    background: linear-gradient(to right, #000, #d1d0d0, #fff);
    border: 2px solid transparent;
    border-radius: 15px;
  }

  &::-moz-range-track {
    background: linear-gradient(to right, #000, #d1d0d0, #fff);
    border: 2px solid transparent;
    border-radius: 15px;
  }
  &::-ms-track {
    background: linear-gradient(to right, #000, #d1d0d0, #fff);
    border: 2px solid transparent;
    border-radius: 15px;
  }
}
</style>
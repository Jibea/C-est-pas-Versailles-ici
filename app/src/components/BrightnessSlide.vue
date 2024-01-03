<script setup lang="ts">
import { defineProps, watch, } from 'vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Light } from '@/types/Light';

const light = ref<Light>();
const baseUrl = ref('');
const brightness = ref(0);


const props = defineProps({
    baseUrl: {
        type: String,
        required: true
    },
    bri: {
        type: Number,
        required: false,
    },
});

const getLightState = async () => {
  if (props.bri) {
    brightness.value = props.bri;
  } else {
    try {
        const response = await axios.get(baseUrl.value);
        light.value = response.data;
        if (light.value?.state.bri) {
          brightness.value = light.value.state.bri;
        }
    } catch (error) {
        console.error('Error get light state brightness: ', error);
    }
  }
}

watch(brightness, (newValue) => {
    brightness.value = newValue;
});

onMounted(() => {
  baseUrl.value = props.baseUrl;
  getLightState();
});


const updateLightState = async () => {
    const validBrightness = Math.min(255, Math.max(0, brightness.value));
    try {
        await axios.put(baseUrl.value + `/state`, {
            bri: validBrightness,
        });
    } catch (error) {
        console.error('Error update brightness: ', error);
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
<script setup lang="ts">
import { defineProps, watch, } from 'vue';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Light } from '@/types/Light';

const light = ref<Light>();
const baseUrl = ref('');
const ColorTemp = ref(0);
const lightHasCt = ref(true);


const props = defineProps({
    baseUrl: {
      type: String,
      required: true,
    },
    ct: {
      type: Number,
      required: false,
    },
});

const getLightState = async () => {
  if (props.ct) {
    ColorTemp.value = props.ct;
  } else {
    try {
        const response = await axios.get(baseUrl.value);
        light.value = response.data;
        if (light.value?.state.ct) {
          ColorTemp.value = light.value.state.ct;
        } else {
          lightHasCt.value = false;
        }
    } catch (error) {
        console.error('Error get light state: ', error);
    }
  }
}

watch(ColorTemp, (newValue) => {
    ColorTemp.value = newValue;
});

onMounted(async () => {
  baseUrl.value = props.baseUrl;
  await getLightState();
});


const updateLightState = async () => {
    const validTemperature = Math.min(light.value?.ctmax, Math.max(light.value?.ctmin, ColorTemp.value));

    try {
        await axios.put(baseUrl.value + `/state`, {
            ct: validTemperature,
        });
    } catch (error) {
        console.error('Error update temperature: ', error);
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
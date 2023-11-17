<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { defineEmits } from 'vue';

    const emit = defineEmits(['remove'])
    const props = defineProps({
      roomName: { type: String, required: true },
      lampsLit: Boolean,
    });

    const buttonClass = computed(() => {
      return {
        'lit': props.lampsLit,
        'not-lit': !props.lampsLit,
      };
    });

    const removeGroup = () => {
      emit('remove', props.roomName, props.lampsLit);
    }

</script>

<template>
  <router-link :to="{ name: 'roomRoute', params: { roomName: roomName } }">
    <button :class="['button', buttonClass]">
        {{ roomName }}
    </button>
  </router-link>
  <button @click="removeGroup()" class="remove-button">-</button>
</template>

<style scoped>
.lit {
  background-color: green;
  color: white;
}

.not-lit {
  background-color: red;
  color: white;
}

.button {
  border: none;
  border-radius: 5px;
  padding: 50px;
  margin: 20px;
  font-size: 1.5em;
}

.remove-button {
  background-color: #e74c3c;
  position: absolute;
  margin-left: -35px;
  margin-top: 5px;
  color: white;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

</style>
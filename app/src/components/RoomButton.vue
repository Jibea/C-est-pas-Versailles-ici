<script setup lang="ts">
import { computed, defineProps } from 'vue';

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

</script>

<template>
  <router-link :to="'/room/' + roomName">
    <button :class="['button', buttonClass]">
        {{ roomName }}
    </button>
  </router-link>
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

</style>
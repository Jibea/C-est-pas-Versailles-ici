<script setup lang="ts">
    import { computed, defineProps } from 'vue';

    const props = defineProps({
      roomName: String,
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
    <button :class="['button', buttonClass]">
        {{ roomName }}
    </button>
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
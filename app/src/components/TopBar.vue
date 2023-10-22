<script lang="ts" setup name="TopBar">
import { defineProps } from 'vue';
const props = defineProps({
    title: { type: String, required: true },
})
</script>

<template>
    <div>
        <h3>{{ props.title }}</h3>
    </div>
</template>

<style scoped>
div {
    background-color: gray;
    height: 40px;
    top: 0px;
    margin: 0px;
    padding: 0px;
}
h3 {
    color: white;
}
</style>

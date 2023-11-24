<script lang="ts" setup name="TopBar">
    import { defineProps } from 'vue';
    import HomeIcon from "@/components/HomeComponent.vue"

const props = defineProps({
    title: { type: String, required: true },
})
</script>

<template>
    <div>
        <HomeIcon />
        <h3>{{ props.title }}</h3>
    </div>
</template>

<style scoped>
div {
    background-color: gray;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
h3 {
    color: white;
    justify-content: center;
    text-align: center;
    padding-top: 2%;
    padding-bottom: 2%;
}
</style>

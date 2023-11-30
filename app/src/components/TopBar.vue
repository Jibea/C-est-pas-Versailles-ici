<script lang="ts" setup name="TopBar">
    import { defineProps } from 'vue';
    import { useRouter } from 'vue-router';
    import HomeIcon from "@/components/HomeComponent.vue"

const props = defineProps({
    title: { type: String, required: true },
})

const router = useRouter();

const goBack = () => {
    router.go(-1);
}

</script>

<template>
    <div class="top-bar">
      <HomeIcon class="home-style"/>
      <font-awesome-icon
        v-if="$route.path !== '/'"
        :icon="['fas', 'arrow-left']"
        class="arrow-icon"
        @click="goBack"
      />
      <h3 class="title">{{ props.title }}</h3>
    </div>
  </template>
  
<style scoped>

.top-bar {
    background-color: gray;
    display: flex;
    align-items: center;
    padding: 30px;
  }

.home-style {
  float: left;
  cursor: pointer;
}

.title {
  color: white;
  font-size: 24px;
  margin: 0 auto;
}

.arrow-icon {
  color: white;
  cursor: pointer;
  font-size: 24px;
  position: relative;
  left: 70px;
}
</style>

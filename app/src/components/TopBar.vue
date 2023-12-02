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

const gotToeditRules = () => {
    router.push('/editRules');
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
      <div @click="gotToeditRules" class="rules">
        <svg xmlns="http://www.w3.org/2000/svg" class="rulepen-icon" height="24" width="24" viewBox="0 0 512 512"><path d="M469.3 19.3l23.4 23.4c25 25 25 65.5 0 90.5l-56.4 56.4L322.3 75.7l56.4-56.4c25-25 65.5-25 90.5 0zM44.9 353.2L299.7 98.3 413.7 212.3 158.8 467.1c-6.7 6.7-15.1 11.6-24.2 14.2l-104 29.7c-8.4 2.4-17.4 .1-23.6-6.1s-8.5-15.2-6.1-23.6l29.7-104c2.6-9.2 7.5-17.5 14.2-24.2zM249.4 103.4L103.4 249.4 16 161.9c-18.7-18.7-18.7-49.1 0-67.9L94.1 16c18.7-18.7 49.1-18.7 67.9 0l19.8 19.8c-.3 .3-.7 .6-1 .9l-64 64c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l64-64c.3-.3 .6-.7 .9-1l45.1 45.1zM408.6 262.6l45.1 45.1c-.3 .3-.7 .6-1 .9l-64 64c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l64-64c.3-.3 .6-.7 .9-1L496 350.1c18.7 18.7 18.7 49.1 0 67.9L417.9 496c-18.7 18.7-49.1 18.7-67.9 0l-87.4-87.4L408.6 262.6z"/></svg>
        <p>Set rules</p>
      </div>
    </div>
  </template>
  
<style lang="scss" scoped>

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

.rules {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor : pointer;
  .penruler-icon {
    color: white;
    cursor: pointer;
    font-size: 24px;
    position: relative;
  }
  p {
    color: white;
    font-size: 20px;
    margin: 0;
  }
}
</style>

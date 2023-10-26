<script setup lang="ts" name="Burger">
    import { Slide } from 'vue3-burger-menu'
</script>

<template>
    <Slide>
        <a id="home" href="#">
            <span>Home</span>
        </a>
        <a id="edit" href="#">
            <span>Edit</span>
        </a>
    </Slide>
</template>

<style scoped>
.bm-burger-button {
    position: fixed !important;
    width: 36px !important;
    height: 30px !important;
    left: 36px !important;
    top: 36px !important;
    cursor: pointer !important;
}
.bm-burger-bars {
  background-color: red !important;
}
.line-style {
    position: absolute !important;
    height: 10% !important;
    left: 0 !important;
    right: 0 !important;
    background-color: red !important;
}
.cross-style {
    position: absolute !important;
    top: 12px !important;
    right: 2px !important;
    cursor: pointer !important;
    background-color: red !important;
}
.bm-cross {
    background: #bdc3c7 !important;
}
.bm-cross-button {
    height: 24px !important;
    width: 24px !important;
}
.bm-menu {
    height: 100% !important; /* 100% Full-height */
    width: 0 !important; /* 0 width - change this with JavaScript */
    position: fixed !important; /* Stay in place */
    z-index: 1000 !important; /* Stay on top */
    top: 0 !important;
    left: 0 !important;
    /* background-color: rgb(63, 63, 65) !important; */
    background-color: red !important;
    overflow-x: hidden !important; /* Disable horizontal scroll */
    padding-top: 60px !important; /* Place content 60px from the top */
    transition: 0.5s !important; /*0.5 second transition effect to slide in the sidenav*/
}
.bm-overlay {
    background: rgba(0, 0, 0, 0.3) !important;
}
.bm-item-list {
    color: #b8b7ad !important;
    margin-left: 10% !important;
    font-size: 20px !important;
}
.bm-item-list > * {
    display: flex !important;
    text-decoration: none !important;
    padding: 0.7em !important;
}
.bm-item-list > * > span {
    margin-left: 10px !important;
    font-weight: 700 !important;
    color: white !important;
}
</style>

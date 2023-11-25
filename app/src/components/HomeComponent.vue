<script lang="ts" setup name="HomeIcon">
    import { useRouter } from 'vue-router';

const router = useRouter();
const redirect_to_login = () => {
    router.push("/");
}
</script>

<template>
    <div>
        <img src="@/assets/homepage.png" @click="redirect_to_login" />
    </div>
</template>


<style scoped lang="scss">

</style>

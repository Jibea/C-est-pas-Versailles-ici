<script setup lang="ts">
    import { defineProps, defineComponent } from 'vue';
    import OnOff from '@/components/OnOff.vue';


    defineProps({
        msg: String,
    });

    defineComponent({
        name: 'LightComponent',
        components: {
            OnOff,
        },
    });

</script>

<template>
    <div class="lightComponent">
        <div class="element">
            <h2>{{ msg }}</h2>
            <OnOff />
        </div>
    </div>
</template>


<style scoped lang="scss">
    .lightComponent {
        .element {
            display : flex;
            background-color: #42b983;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: auto;
            width: auto;
            padding: 8px;
        }
    }
</style>

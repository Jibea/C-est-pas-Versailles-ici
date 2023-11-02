<script setup lang="ts">
    import { defineProps, defineComponent, ref, onMounted } from 'vue';
    import OnOff from '@/components/OnOff.vue';

    defineProps({
        name: String,
    });

    defineComponent({
        name: 'MotionSensor',
        components: {
            OnOff
        },
    });
    //value to get from the api
    let timeOn = ref(0);

    const print = () => {
        console.log(timeOn.value);
    }

    onMounted(() => {
        console.log('Component is mounted');
    });

</script>

<template>
    <div class="MotionSensor">
        <div class="all">
            <div class="element">
                <h2>{{ name }}</h2>
                <input v-model.number="timeOn" type="number" step="1" :onChange="print"/>
            </div>
            <div class="button">
                <OnOff />
                <input type="submit" value="Save" />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">

    .MotionSensor {
        background-color: #ffdc2b;
        .all {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            height: auto;
            width: auto;
            padding: 8px;

            .element {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: auto;
                justify-content: center;
                padding: 8px;

            }
        }
    }

</style>
<script setup lang="ts">

import { defineProps, onMounted , watch} from 'vue';
import { useRouter } from 'vue-router';
import {Sensor} from '@/types/Sensors';
import {Rule} from '@/types/Rule';
import TopBar from '@/components/TopBar.vue';
import { ref } from 'vue';
import axios from 'axios';

const sensorSelected = ref('');
const sensorId = ref('');
const conditionSelected = ref('');
const actionSelected = ref('');
const groupSelected = ref('');
const groupId = ref('');
const fieldsFilled = ref(false);

const ruleName = ref('');
const rule = ref({
  "name": ruleName.value,
  "conditions": [
    {
      "address": "",
      "operator": "eq",
      "value": true
    }
  ],
  "actions": [
    {
      "address": ``,
      "method": "POST",
      "body": {
        "on": actionSelected.value == 'on' ? true : false
      },
    }
  ],
});

const sensors = ref<Sensor[]>([]);
const conditions = ref(['movement', 'button pressed']);
const actions = ref(['on', 'off']);
const groups = ref([]);

onMounted(() => {
  getAllSensors();
  getAllGroups();
  checkFields();
  getAllRules();

});

const getAllRules = async () => {
  const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/rules`);
  console.log(response);
};

const checkFields = () => {
  if (sensorSelected.value != '' && conditionSelected.value != '' && actionSelected.value != '' && groupSelected.value != '' && ruleName.value != '') {
    fieldsFilled.value = true;
  } else {
    fieldsFilled.value = false;
  }
};

watch([sensorSelected, conditionSelected, actionSelected, groupSelected, ruleName], () => {
  checkFields();
});

const getAllSensors = async () => {
  const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/sensors`);

  sensors.value =  response.data as Sensor[];
  const ids = Object.keys(response.data);

  //FIXME ajoute la propriété id à chaque sensor (j'ai pas réussi à faire autrement)
  for (let i = 0; i < ids.length; i++) {
    let sensor = sensors.value[ids[i]];
    sensor.id = ids[i];
    sensorId.value = ids[i];
  }
};

const getAllGroups = async () => {
  const response = await axios.get(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/groups`);
  groups.value = response.data;
  const ids = Object.keys(response.data);

  for (let i = 0; i < ids.length; i++) {
    let group = groups.value[ids[i]];
    group.id = ids[i];
    groupId.value = ids[i];
  }
};

const sendRule = async () => {
  const response = await axios.post(`http://${process.env.VUE_APP_GATEWAY_IP}/api/${process.env.VUE_APP_API_KEY}/rules`, rule.value);
  console.log("rules s value" + rule.value);
  console.log(response);
};

const createRule = () => {
    rule.value.name = ruleName.value;
    rule.value.conditions[0].address = `/sensors/${sensorId.value}/state/presence`;
    rule.value.actions[0].address = `/groups/${groupId.value}/action`;
    rule.value.actions[0].body.on = actionSelected.value == 'on' ? true : false;
    console.log(rule.value);
    sendRule();

};


</script>

<template>
  <div class="EditRulesView">
    <TopBar title="Edit Rules" />
    <form class="editRules" @submit.prevent="validateForm">
      <h1>Rules</h1>

      <section class="all-select">
        <div>
          <h2> Rule name</h2>
          <input type="text" v-model.trim.lazy="ruleName" required="true"
          placeholder="Rule name" />
        </div>
        <div>
          <h2> Sensor name</h2>
          <select v-model="sensorSelected" required="true">
            <option v-for="(sensor, index) in sensors" :key="index" :value="sensor">
              {{ sensor.name }}
            </option>
          </select>
        </div>
        <div>
          <h2> Group associated</h2>
          <select v-model="groupSelected" required="true">
            <option v-for="(group, index) in groups" :key="index" :value="group">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <h2> Condition</h2>
          <select v-model="conditionSelected" required="true">
            <option v-for="(condition, index) in conditions" :key="index" :value="condition">
              {{ condition }}
            </option>
          </select>
        </div>
        <div>
          <h2> Action</h2>
          <select v-model="actionSelected" required="true">
            <option v-for="(action, index) in actions" :key="index" :value="action">
              {{ action }}
            </option>
          </select>
        </div>
        <button
          v-if="fieldsFilled == true"
        @click="createRule"
        >Validate</button>
      </section>
      <h3 v-if="fieldsFilled == false" style="color: red;">  *all fields must be filled</h3>
    </form>
  </div>
  <div>
    <p> {{ rule }} </p>
  </div>
</template>


<style lang="scss" scoped>

  .editRules {
    background-color: rgb(182, 182, 182);
    max-width: 600px;
    margin: 30px auto;
  }

  .all-select {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin: 0 auto;
    div {
      margin: 10px;
    }
    input {
      width: 120px;
    }
    button {
    padding: 1.3em 3em;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    font-weight: 500;
    color: #000;
    background-color: #fff;
    border: none;
    border-radius: 45px;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease 0s;
    cursor: pointer;
    outline: none;
  }

button:hover {
  background-color: #5f91e9;
  box-shadow: 0px 15px 20px rgba(38, 104, 202, 0.4);
  color: #fff;
  transform: translateY(-7px);
}

button:active {
  transform: translateY(-1px);
}
  }

</style>@/types/Rule
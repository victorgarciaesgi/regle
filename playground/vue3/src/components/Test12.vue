<template>
  <div>
    <h1> $anyEdited dosent track when replacing an item in a collection that has its own nested objects or arrays </h1>
    <h2>Steps to Replicate</h2>
    <ol>
      <li> Setup a collection form field thats an array where each item might have nested objects or other arrays </li>
      <li>Mimic the initial data call</li>
      <li>Replace with a different item</li>
      <li>See that $anyEdited hasnt changed</li>
    </ol>
    <h2>Playground</h2>
    <div class="button-list">
      <button class="primary" type="button" @click="mimicInitialDataLoad"> Mimic Initial Data Call </button>
    </div>
    <h3>Options</h3>
    <ul>
      <li v-for="option in options" :key="option.uniqueReference">
        {{ option.title }}
        <button @click="addUser(option.uniqueReference)" type="button"> Add </button>
        <button @click="replaceUser(option.uniqueReference)" type="button"> Replace </button>
      </li>
    </ul>
    sdds

    <h3>Selected Options</h3>
    <ul>
      <li v-for="option in form.collection" :key="option.uniqueReference">
        {{ option.title }}
        <button @click="removeUser(option.uniqueReference)" type="button"> Remove </button>
      </li>
      <li v-if="form.collection.length === 0">No Options Selected</li>
    </ul>

    <h3>Regle Variables</h3>
    <dl>
      <div>
        <dt>
          <strong><code>r$.$anyEdited</code></strong>
        </dt>
        <dd>
          <code>{{ r$.$anyEdited }}</code>
        </dd>
      </div>
      <div>
        <dt>
          <strong><code>r$.$fields.collection.$anyEdited</code></strong>
        </dt>
        <dd>
          <code>{{ r$.$fields.collection.$anyEdited }}</code>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { reactive } from 'vue';
import { minLength, required } from '@regle/rules';

interface Option {
  id: number;
  name: string;
  age: number;
}

const options = [
  {
    id: '2f7f5369-d024-4a4f-a66a-c65135d35704',
    uniqueReference: 'PRO-9',
    title: 'Dulce Turnpike',
    businessUnit: {
      id: '5207aba3-0d59-4e4c-a9cc-8ed5fad00a47',
      uniqueReference: 'BU-30',
      title: 'Construction',
    },
    phase: [],
  },
  {
    id: '87011815-3fcf-4193-8726-ba27ad075dc7',
    uniqueReference: 'PRO-15',
    title: 'Broderick Overpass',
    businessUnit: {
      id: '5207aba3-0d59-4e4c-a9cc-8ed5fad00a47',
      uniqueReference: 'BU-30',
      title: 'Construction',
    },
    phase: [],
  },
  {
    id: 'fb6f9860-337c-46b6-b064-a5c9096afaf2',
    uniqueReference: 'PRO-16',
    title: 'Fay Wells',
    businessUnit: {
      id: '67e948c4-648d-414d-bbe4-cd3529b97dc0',
      uniqueReference: 'BU-26',
      title: 'Maintenance',
    },
    phase: [],
  },
  {
    id: '1021fbd5-0931-47f1-a85b-6a4514b4d700',
    uniqueReference: 'PRO-13',
    title: 'Kamron Crescent',
    businessUnit: {
      id: '5207aba3-0d59-4e4c-a9cc-8ed5fad00a47',
      uniqueReference: 'BU-30',
      title: 'Construction',
    },
    phase: [],
  },
];

const form = reactive<{ collection: Array<Option> }>({
  collection: [],
});

const addUser = (id: number) => {
  const optionItem = options.find((item) => item.uniqueReference === id);
  if (optionItem) {
    form.collection.push(optionItem);
  }
};

const replaceUser = (id: number) => {
  const optionItem = options.find((item) => item.uniqueReference === id);
  if (optionItem) {
    form.collection.length = 0;
    form.collection.push(optionItem);
  }
};

const removeUser = (id: number) => {
  const collectionIndex = form.collection.findIndex((item) => item.uniqueReference === id);
  if (collectionIndex > -1) {
    form.collection.splice(collectionIndex, 1);
  }
};

const rules = {
  collection: {
    minLength: minLength(4),
    $each: {},
    $deepCompare: true,
  },
};

const { r$ } = useRegle(form, rules, {
  autoDirty: true,
  silent: false,
  lazy: false,
});

const mimicInitialDataLoad = () => {
  setTimeout(() => {
    const newData = {
      collection: [options[0]],
    };
    Object.assign(form, { ...newData });
    r$.$reset();
  }, 500);
};
</script>

<style lang="scss"></style>

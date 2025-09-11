<template>
  <div>
    <h1>Issue #122</h1>
    <h2>Steps to Replicate</h2>
    <ol>
      <li>Define a $key for the collection</li>
      <li>Add any item either by call or locally</li>
      <li>
        See error in console
        <code>can't access property "$name", e is undefined</code>
      </li>
    </ol>
    <h2>Playground</h2>
    <div class="button-list">
      <button class="primary" type="button" @click="mimicInitialDataLoad"> Mimic Initial Data Call </button>
    </div>
    <h3>Options</h3>
    <ul>
      <li v-for="option in options" :key="option.id">
        {{ option.name }}
        <button @click="addUser(option.id)" type="button">Add</button>
      </li>
    </ul>

    <h3>Selected Options</h3>
    <ul>
      <li v-for="option in form.collection" :key="option.id">
        {{ option.name }}
        <button @click="removeUser(option.id)" type="button">Remove</button>
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
    id: 1,
    name: 'Dave',
    axuData: {
      address: '123 Round Cresent',
    },
    age: 20,
  },
  {
    id: 2,
    name: 'Jane',
    axuData: {
      address: '123 Street Road',
    },
    age: 30,
  },
  {
    id: 3,
    name: 'Becky',
    axuData: {
      address: '123 Leafy Mews',
    },
    age: 40,
  },
  {
    id: 4,
    name: 'Josh',
    axuData: {
      address: '123 Bushy Mount',
    },
    age: 50,
  },
];

const form = reactive<{ collection: Array<Option> }>({
  collection: [],
});

const addUser = (id: number) => {
  const optionItem = options.find((item) => item.id === id);
  if (optionItem) {
    form.collection.push(optionItem);
  }
};

const removeUser = (id: number) => {
  const collectionIndex = form.collection.findIndex((item) => item.id === id);
  if (collectionIndex > -1) {
    form.collection.splice(collectionIndex, 1);
  }
};

const rules = {
  collection: {
    minLength: minLength(4),
    $each: (item) => ({
      $key: item.value.id,
      name: { required },
    }),
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
      collection: [
        {
          id: 2,
          name: 'Jane',
          axuData: {
            address: '123 Street Road',
          },
          age: 30,
        },
      ],
    };
    Object.assign(form, { ...newData });
    r$.$reset();
  }, 500);
};
</script>

<style lang="scss"></style>

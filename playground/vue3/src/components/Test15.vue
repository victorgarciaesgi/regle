<template>
  <div>
    <h1> Issue #122 </h1>
    <h2>Steps to Replicate</h2>
    <ol>
      <li> Mimic the initial data call - this will add "Jane" in selected options and call <code>$reset()</code> </li>
      <li> Add another user from the options - see that <code>$anyEdited</code> becomes <code>true</code> </li>
      <li>
        Remove "Jane" from selected options - see that <code>$anyEdited</code> becomes <code>false</code> when it should
        be <code>true</code>
      </li>
      <li>
        No matter which users are added and removed <code>$anyEdited</code> will always become <code>false</code> when
        the array length matches the initial call
      </li>
    </ol>
    <h2>Playground</h2>
    <div class="button-list">
      <button class="primary" type="button" @click="mimicInitialDataLoad">Mimic Initial Data Call</button>
    </div>
    <h3> Options </h3>
    <ul>
      <li v-for="option in options" :key="option.id">
        {{ option.name }} <button @click="addUser(option.id)" type="button">Add</button>
      </li>
    </ul>

    <h3> Selected Options </h3>
    <ul>
      <li v-for="option in form.collection" :key="option.id">
        {{ option.name }} <button @click="removeUser(option.id)" type="button">Remove</button>
      </li>
      <li v-if="form.collection.length === 0"> No Options Selected </li>
    </ul>

    <h3> Regle Variables </h3>
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
      <div>
        <dt>
          <strong><code>r$.$fields.collection.$edited</code></strong>
        </dt>
        <dd>
          <code>{{ r$.$fields.collection.$edited }}</code>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { reactive, ref } from 'vue';
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
    age: 20,
  },
  {
    id: 2,
    name: 'Jane',
    age: 30,
  },
  {
    id: 3,
    name: 'Becky',
    age: 40,
  },
  {
    id: 4,
    name: 'Josh',
    age: 50,
  },
];

const form = ref<{ collection: Array<Option> }>({
  collection: [],
});

const addUser = (id: number) => {
  const optionItem = options.find((item) => item.id === id);
  if (optionItem) {
    form.value.collection.push(optionItem);
  }
};

const removeUser = (id: number) => {
  const collectionIndex = form.value.collection.findIndex((item) => item.id === id);
  if (collectionIndex > -1) {
    form.value.collection.splice(collectionIndex, 1);
  }
};

const { r$ } = useRegle(form, {
  collection: {
    // $rewardEarly avoid the error being display too soon
    minLength: minLength(4),
  },
});

const mimicInitialDataLoad = () => {
  setTimeout(() => {
    form.value.collection = [
      {
        id: 2,
        name: 'Jane',
        age: 30,
      },
    ];
    r$.$reset();
  }, 500);
};
</script>

<style lang="scss"></style>

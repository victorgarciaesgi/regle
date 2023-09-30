<template>
  <div style="display: flex; flex-flow: column wrap; width: 400px">
    <input v-model="form.email" placeholder="email" />
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>
    <input v-model.number="limit" placeholder="limit" />

    <input v-model="form.firstName" placeholder="firstName" />
    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>
    <pre>
      <code>
state: {{ state }}
rulesResults: {{ rulesResults }}
errors: {{ errors }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { maxLength, required } from '@shibie/core';
import { ref } from 'vue';
import { not, useForm } from './validations';

const form = ref({
  email: '',
  firstName: '',
  foo: 5,
});

const limit = ref(2);

const { state, rulesResults, errors, $shibie } = useForm(form, () => ({
  email: {
    required: () => {
      return limit.value === 2;
    },
    maxLength: maxLength(100),
  },
  firstName: {
    required,
    not: not(form.value.email),
  },
  foo: {
    required,
  },
}));

// $shibie.value.fields.foo.$value;
</script>

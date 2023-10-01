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
import { maxLength, required, requiredIf } from '@shibie/core';
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
    required: (value: any) => {
      console.log(limit.value, value);
      if (limit.value === 2) {
        return value != '' && value != null;
      }
      return true;
    },
    maxLength: maxLength(3),
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

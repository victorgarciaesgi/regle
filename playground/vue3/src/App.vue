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
import { useForm, required, maxLength } from '@shibie/core';
import { ref } from 'vue';

const form = ref({
  email: '',
  firstName: '',
});

const limit = ref(10);

const { state, rulesResults, errors } = useForm(form, () => ({
  email: { required },
  firstName: { required, maxLength: maxLength(limit.value) },
}));
</script>

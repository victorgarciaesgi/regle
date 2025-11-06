<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>The field is required</label>
    </div>
    <div>
      <input
        v-model="form.name"
        :class="{ valid: r$.name.$correct, error: r$.name.$error }"
        :placeholder="`Type your name${r$.name.$rules.required.$active ? '*' : ''}`"
      />
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { requiredIf } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ name: '' });
const condition = ref(false);

const { r$ } = useRegle(form, {
  name: { required: requiredIf(condition) },
});
</script>

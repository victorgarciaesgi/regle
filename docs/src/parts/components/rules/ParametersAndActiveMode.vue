<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>The field is required</label>
    </div>
    <div>
      <input
        v-model="form.name"
        :class="{ valid: regle.$fields.name.$valid }"
        :placeholder="`Type your name${regle.$fields.name.$rules.required.$active ? '*' : ''}`"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <ul v-if="errors.name.length">
      <li v-for="error of errors.name" :key="error">
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

const { regle, errors, resetAll } = useRegle(form, {
  name: { required: requiredIf(condition) },
});
</script>

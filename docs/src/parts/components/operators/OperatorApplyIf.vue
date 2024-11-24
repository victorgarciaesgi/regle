<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>Require min length of 6</label>
    </div>
    <div>
      <input
        v-model="form.name"
        :class="{ valid: regle.$fields.name.$valid, error: regle.$fields.name.$error }"
        placeholder="Type your name"
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
import { minLength, applyIf } from '@regle/rules';
import { ref } from 'vue';

const condition = ref(false);

const form = ref({ name: '' });

const { state, errors, regle, resetAll } = useRegle(form, {
  name: {
    minLength: applyIf(condition, minLength(6)),
  },
});
</script>

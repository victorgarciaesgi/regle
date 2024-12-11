<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>The field is required</label>
    </div>
    <div>
      <input
        v-model="form.name"
        :class="{ valid: r$.$fields.name.$valid, error: r$.$fields.name.$error }"
        :placeholder="`Type your name${r$.$fields.name.$rules.required.$active ? '*' : ''}`"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
  <JSONViewer :data="r$.$fields.name"></JSONViewer>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { requiredIf } from '@regle/rules';
import { ref } from 'vue';
import JSONViewer from './JSONViewer.vue';

const form = ref({ name: '' });
const condition = ref(false);

const { r$ } = useRegle(form, {
  name: { required: requiredIf(condition) },
});
</script>

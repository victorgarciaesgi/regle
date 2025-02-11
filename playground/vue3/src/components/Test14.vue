<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>The field is required</label>
    </div>
    <div>
      <input
        type="date"
        v-model="form.foo"
        :class="{ valid: r$.$fields.foo.$correct, error: r$.$fields.foo.$error }"
        :placeholder="`Type your foo${r$.$fields.foo.$rules.required.$active ? '*' : ''}`"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
    <ul v-if="r$.$errors.foo.length">
      <li v-for="error of r$.$errors.foo" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
  <JSONViewer :data="r$"></JSONViewer>
</template>

<script setup lang="ts">
import { inferRules, useRegle } from '@regle/core';
import { applyIf, minLength, required } from '@regle/rules';
import { ref } from 'vue';
import JSONViewer from './JSONViewer.vue';

type Form = {
  foo: Date;
};

const form = ref<Form>({ foo: new Date() });
const condition = ref(false);

const { r$ } = useRegle(form, {
  foo: {
    required,
  },
});
</script>

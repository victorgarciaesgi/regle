<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>Require min length of 6</label>
    </div>

    <div>
      <input
        v-model="form.name"
        :class="{ valid: r$.$fields.name.$correct, error: r$.$fields.name.$error }"
        placeholder="Type your name"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
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
import { minLength, applyIf } from '@regle/rules';
import { ref } from 'vue';

const condition = ref(false);

const form = ref({ name: '' });

const { r$ } = useRegle(form, {
  name: {
    minLength: applyIf(condition, minLength(6)),
  },
});
</script>

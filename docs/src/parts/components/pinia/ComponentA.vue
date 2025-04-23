<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.email"
        :class="{ valid: r$.$fields.email.$correct, error: r$.$fields.email.$error }"
        placeholder="Type your email"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);
</script>

<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.email"
        :class="{ valid: r$.$fields.email.$valid, error: r$.$fields.email.$error }"
        placeholder="Type your email"
      />
      <button type="button" @click="demoStore.resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { state, r$ } = storeToRefs(demoStore);
</script>

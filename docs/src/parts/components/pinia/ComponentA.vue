<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.email"
        :class="{ valid: r$.$fields.email.$valid, error: r$.$fields.email.$error }"
        placeholder="Type your email"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { r$ } = storeToRefs(demoStore);
</script>

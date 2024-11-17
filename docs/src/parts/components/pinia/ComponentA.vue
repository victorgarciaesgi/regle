<template>
  <div class="demo-container">
    <div>
      <input v-model="state.email" placeholder="Type your email" />
      <button type="button" @click="demoStore.resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { state } = storeToRefs(demoStore);
</script>

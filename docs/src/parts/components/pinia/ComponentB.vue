<template>
  <div class="demo-container">
    <ul v-if="errors.email.length" class="standalone">
      <li v-for="error of errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
    <span v-else>No errors</span>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from './demo.store';
import { storeToRefs } from 'pinia';

const demoStore = useDemoStore();
const { errors } = storeToRefs(demoStore);
</script>

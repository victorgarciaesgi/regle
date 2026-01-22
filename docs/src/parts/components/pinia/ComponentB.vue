<template>
  <div class="demo-container">
    <ul v-if="r$.$errors.email.length" class="standalone">
      <li v-for="error of r$.$errors.email" :key="error">
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
  const { r$ } = storeToRefs(demoStore);
</script>

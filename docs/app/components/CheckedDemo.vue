<template>
  <div class="demo-container">
    <label>
      <input v-model="r$.$value.terms" type="checkbox" />
      I accept the terms and conditions
    </label>
    <ul v-if="r$.$errors.terms.length">
      <li v-for="error of r$.$errors.terms" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { checked } from '@regle/rules';

  const { r$ } = useRegle(
    { terms: false },
    {
      terms: { checked },
    }
  );
</script>

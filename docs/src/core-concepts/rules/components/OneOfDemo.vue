<template>
  <div class="demo-container">
    <select v-model="r$.$value.fruit" :class="{ valid: r$.fruit.$correct, error: r$.fruit.$error }">
      <option value="">Pick a fruit</option>
      <option value="Apple">Apple</option>
      <option value="Banana">Banana</option>
      <option value="Cherry">Cherry</option>
    </select>
    <ul v-if="r$.$errors.fruit.length">
      <li v-for="error of r$.$errors.fruit" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { oneOf } from '@regle/rules';

  const { r$ } = useRegle(
    { fruit: '' },
    {
      fruit: { oneOf: oneOf(['Apple', 'Banana', 'Cherry']) },
    }
  );
</script>

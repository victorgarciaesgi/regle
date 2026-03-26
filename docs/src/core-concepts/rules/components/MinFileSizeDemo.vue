<template>
  <div class="demo-container">
    <label>Upload a file (min 100 KB):</label>
    <input type="file" @change="handleFile" />
    <ul v-if="r$.$errors.file.length">
      <li v-for="error of r$.$errors.file" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { minFileSize } from '@regle/rules';

  const { r$ } = useRegle(
    { file: null as File | null },
    {
      file: { minFileSize: minFileSize(100_000) },
    }
  );

  function handleFile(e: Event) {
    const target = e.target as HTMLInputElement;
    r$.$value.file = target.files?.[0] ?? null;
  }
</script>

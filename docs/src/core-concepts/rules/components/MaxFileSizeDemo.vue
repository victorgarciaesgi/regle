<template>
  <div class="demo-container">
    <label>Upload a file (max 1 MB):</label>
    <br />
    <input type="file" @change="handleFile" />
    <ul v-if="r$.$errors.file.length">
      <li v-for="error of r$.$errors.file" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { maxFileSize } from '@regle/rules';

  const { r$ } = useRegle(
    { file: null as File | null },
    {
      file: { maxFileSize: maxFileSize(1_000_000) },
    }
  );

  function handleFile(e: Event) {
    const target = e.target as HTMLInputElement;
    r$.$value.file = target.files?.[0] ?? null;
  }
</script>

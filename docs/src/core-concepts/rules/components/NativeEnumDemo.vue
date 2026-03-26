<template>
  <div class="demo-container">
    <select v-model="r$.$value.status" :class="{ valid: r$.status.$correct, error: r$.status.$error }">
      <option value="">Select a status</option>
      <option v-for="val in StatusEnum" :key="val" :value="val">{{ val }}</option>
    </select>
    <ul v-if="r$.$errors.status.length">
      <li v-for="error of r$.$errors.status" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { nativeEnum } from '@regle/rules';

  enum StatusEnum {
    Active = 'Active',
    Inactive = 'Inactive',
    Pending = 'Pending',
  }

  const { r$ } = useRegle(
    { status: '' as string },
    {
      status: { nativeEnum: nativeEnum(StatusEnum) },
    }
  );
</script>

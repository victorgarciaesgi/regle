<template>
  <label>
    Name B
    <input v-model="r$.$value.name" data-testid="dynamic-form-b-name" />
  </label>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref({ name: '' });

  const { r$ } = useRegle(form, {
    name: { required },
  });
</script>

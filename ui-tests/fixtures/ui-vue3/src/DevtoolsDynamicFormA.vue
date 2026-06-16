<template>
  <label>
    Email A {{ formKey }}
    <input v-model="r$.$value.email" :data-testid="`dynamic-form-a-email-${formKey}`" />
  </label>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required } from '@regle/rules';
  import { ref } from 'vue';

  defineProps<{ formKey: number }>();

  const form = ref({ email: '' });

  const { r$ } = useRegle(form, {
    email: { required },
  });
</script>

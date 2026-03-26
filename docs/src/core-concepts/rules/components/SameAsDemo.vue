<template>
  <div class="demo-container">
    <DemoField v-model="r$.$value.password" :field="r$.password" type="password" placeholder="Password" />
    <br />
    <DemoField v-model="r$.$value.confirm" :field="r$.confirm" type="password" placeholder="Confirm password" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { required, sameAs } from '@regle/rules';

  const form = ref({ password: '', confirm: '' });

  const { r$ } = useRegle(form, {
    password: { required },
    confirm: { required, sameAs: sameAs(() => form.value.password) },
  });
</script>

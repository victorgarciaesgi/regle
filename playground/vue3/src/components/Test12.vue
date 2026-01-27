<script setup lang="ts">
  import { ref, type MaybeRef, type Ref } from 'vue';
  import { useRegle, type JoinDiscriminatedUnions } from '@regle/core';
  import { required, minLength, email } from '@regle/rules';

  const state = ref({ value: '' });

  // useRegle('', {});

  const foo = useRegle(state, {
    value: {
      required,
    },
  });
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

<template>
  <main>
    <code>r$.$errors</code>
    <JSONViewer :data="r$.$errors" />

    <code>flatErrors(r$.$errors)</code>
    ⬇️
    <JSONViewer :data="flatErrors(r$.$errors)" />

    <code>flatErrors(r$.$errors, {includePath: true})</code>
    ⬇️
    <JSONViewer :data="flatErrors(r$.$errors, { includePath: true })" />
    <button type="button" @click="r$.$validate">Submit</button>
  </main>
</template>

<script setup lang="ts">
import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import JSONViewer from './JSONViewer.vue';

const { r$ } = useRegle(
  { name: '', level0: { email: 'bar' }, collection: [{ foo: '' }] },
  {
    name: { required, minLength: minLength(5) },
    level0: {
      email: { email },
    },
    collection: {
      $each: {
        foo: {
          required,
        },
      },
    },
  }
);
</script>

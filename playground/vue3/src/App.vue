<template>
  <TestForm />
</template>

<script setup lang="ts">
import TestForm from './components/TestForm.vue';

import { useRegle, type RegleComputedRules } from '@regle/core';
import { computed, ref } from 'vue';

// const form = ref({ name: [{ foo: '' }] });

// const rules = computed(
//   () =>
//     ({
//       name: {
//         $each: (value, index) => ({
//           foo: {},
//         }),
//       },
//     }) satisfies RegleComputedRules<typeof form>
// );

// const { r$ } = useRegle(form, rules);
</script>

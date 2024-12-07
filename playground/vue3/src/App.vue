<template>
  <!-- <TestForm /> -->
  <Test13 />
</template>

<script setup lang="ts">
import TestForm from './components/TestForm.vue';
import TestF12 from './components/Test12.vue';
import Test13 from './components/Test13.vue';

import { useRegle, type RegleComputedRules } from '@regle/core';
import { computed, ref, version } from 'vue';

console.log(version);

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

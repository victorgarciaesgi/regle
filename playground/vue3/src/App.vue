<template>
  <!-- <TestForm /> -->
  <!-- <ValibotForm /> -->
  <!-- <ZodForm /> -->
  <!-- <ZodValibotTypes /> -->
  <!-- <ArkTypeForm /> -->
  <Test13 />
  <!-- <Parent /> -->
  <!-- <ParentNested /> -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Test13 from './components/Test13.vue';
import ValibotForm from './components/ValibotForm.vue';
import ZodValibotTypes from './components/ZodValibotTypes.vue';
import ArkTypeForm from './components/ArkTypeForm.vue';

import ZodForm from './components/ZodForm.vue';
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';
import Parent from './components/tests-pinia/Parent.vue';
import ParentNested from './components/nested-collection/ParentNested.vue';
</script>

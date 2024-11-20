<template>
  <div style="display: flex">
    <!-- <MyForm />
    <MyForm /> -->

    <!-- <TestForm /> -->
    <!-- <Repro /> -->

    <!-- <ZodForm /> -->
    <Parent />
  </div>
</template>

<script setup lang="ts">
import MyForm from './components/MyForm.vue';
import TestForm from './components/TestForm.vue';
import Repro from './components/ReproductionForm.vue';
import Parent from './components/test-props/Parent.vue';

import ZodForm from './components/ZodForm.vue';
</script>

<template>
  <TestForm />
</template>

<script setup lang="ts">
import TestForm from './components/TestForm.vue';

import { inferRules, useRegle } from '@regle/core';
import { computed, ref } from 'vue';

const form = ref({ name: '' });

const rules = computed(() => inferRules(form, {}));

const { r$ } = useRegle(form, rules);
</script>

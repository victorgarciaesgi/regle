<template>
  <div>{{ regle }}</div>
</template>

<script setup lang="ts">
import { inferRules, useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { computed, ref } from 'vue';

const form = ref({ name: { firstName: '', lastName: '' } });

const rules = computed(() =>
  inferRules(form, {
    name: {
      firstName: {},
    },
  })
);

const { regle } = useRegle(form, rules);
</script>

<style lang="scss" scoped></style>

<template>
  <input v-model="min" placeholder="min" />
  <input v-model="form.email" placeholder="name" />
  <pre>{{ r$ }}</pre>
</template>

<script setup lang="ts">
import { inferRules, useRegle, type Maybe } from '@regle/core';
import { applyIf, maxLength, minLength, required, withAsync, withParams } from '@regle/rules';
import { computed, ref } from 'vue';
import { timeout } from './validations';

const min = ref(6);
const form = ref({
  email: '',
  user: {
    firstName: '',
    lastName: '',
  },
  contacts: [{ name: '' }],
});

async function asyncMin(value: Maybe<string>, min: number) {
  await timeout(1000);
  return { $valid: (value?.length ?? 0) > min, foo: min };
}

const condition = ref(false);

const test = applyIf(condition, minLength(6));
const {} = useRegle(
  { name: '' },
  {
    name: {
      minLength: applyIf(condition, minLength(6)),
    },
  }
);

const { r$ } = useRegle(form, {
  email: { testParams: withAsync(asyncMin, [min]) },
  user: {
    firstName: {
      testParams: withAsync(asyncMin, [() => min.value]),
    },
  },
  contacts: {
    $each: {
      name: {
        testParams: withAsync(asyncMin, [min]),
      },
    },
  },
});
</script>

<style lang="scss" scoped></style>

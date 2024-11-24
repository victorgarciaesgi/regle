<template>
  <input v-model="min" placeholder="min" />
  <input v-model="form.email" placeholder="name" />
  <pre>{{ regle }}</pre>
</template>

<script setup lang="ts">
import { inferRules, useRegle, type Maybe } from '@regle/core';
import { required, withAsync, withParams } from '@regle/rules';
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

const { regle } = useRegle(form, {
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

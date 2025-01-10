<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    <input type="text" v-model="data.a.one.two.three" />

    <pre>
      {{ r$ }}
    </pre>
  </main>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { and, applyIf, checked, minLength, required, withMessage } from '@regle/rules';
import { ref } from 'vue';

const data = ref({
  a: {
    one: {
      two: { three: '' },
    },
    two: { three: { four: {} } },
    three: { four: '' },
  },
  b: {},
  c: {},
});

const { r$ } = useRegle(data, {
  a: {
    one: { two: { three: { required } } },
  },
});

r$.$reset();
</script>

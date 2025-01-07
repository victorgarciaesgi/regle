<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    <input type="checkbox" v-model="data.name" />

    {{ r$.$errors }}
  </main>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { and, applyIf, checked, minLength, required, withMessage } from '@regle/rules';
import { ref } from 'vue';

const condition = ref(true);

const data = ref<{ name?: boolean }>({
  name: undefined,
});

const { r$ } = useRegle(data, {
  name: {
    checked: withMessage(
      applyIf(
        () => {
          return condition.value;
        },
        and(required, checked)
      ),
      'The terms and conditions must be accepted'
    ),
  },
});
</script>

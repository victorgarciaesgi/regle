<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 500px"> </div>
</template>

<script setup lang="ts">
  const someAsyncCall = async () => await Promise.resolve(true);
  // ---cut---
  // @noErrors
  import { defineRegleConfig, createRule, type Maybe } from '@regle/core';
  import { withMessage, isFilled } from '@regle/rules';

  const asyncEmail = createRule({
    async validator(value: Maybe<string>) {
      if (!isFilled(value)) {
        return true;
      }

      const result = await someAsyncCall();
      return result;
    },
    message: 'Email already exists',
  });

  const { useRegle: useCustomRegle } = defineRegleConfig({
    rules: () => ({
      asyncEmail,
    }),
  });

  const { r$ } = useCustomRegle(
    { name: '' },
    {
      name: {},
    }
  );
</script>

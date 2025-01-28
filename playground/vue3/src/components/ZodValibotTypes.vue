<template>
  <input v-model="r$.$value.password" :class="{ error: r$.$fields.password.$error }" placeholder="Type your password" />

  <ul>
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>

  <input
    v-model="r$.$value.nested.confirm"
    :class="{ error: r$.$fields.nested.$fields.confirm.$error }"
    placeholder="Type your confirm"
  />

  <ul>
    <li v-for="error of r$.$errors.nested.confirm" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="r$.$resetAll">Reset</button>
  <button @click="r$.$validate">Submit</button>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';
import { z } from 'zod';

const schema = z
  .object({
    password: z.string().min(1),
    nested: z.object({
      confirm: z.string().min(1),
    }),
  })
  .refine((data) => data.password === data.nested.confirm, {
    message: "Passwords don't match",
    path: ['nested', 'confirm'], // path of error
  });

const { r$ } = useRegleSchema({ password: '', nested: { confirm: '' } }, schema);
</script>

<style lang="scss" scoped></style>

<template>
  <input v-model="r$.$value.password" :class="{ error: r$.$fields.password.$error }" placeholder="Type your password" />

  <ul>
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>

  <div v-for="(item, index) of r$.$fields.nested.$each" :key="item.$id" class="item">
    <div class="field">
      <input
        v-model="item.$value.confirm"
        :class="{ valid: item.$fields.confirm.$valid, error: item.$fields.confirm.$error }"
        placeholder="Type an item value"
      />

      <div v-if="r$.$value.nested.length > 1" class="delete" @click="r$.$value.nested.splice(index, 1)">🗑️</div>
    </div>

    <ul v-if="item.$fields.confirm.$errors.length">
      <li v-for="error of item.$fields.confirm.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>

  <button type="button" @click="r$.$value.nested.push({ confirm: '' })">🆕 Add item</button>
  <button @click="r$.$resetAll">Reset</button>
  <button @click="r$.$validate">Submit</button>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(1),
  nested: z
    .array(
      z.object({
        confirm: z.string().min(1),
      })
    )
    .refine(
      (arg) => {
        return arg[0].confirm === 'foo';
      },
      {
        message: 'First item confirm must be "foo"',
        path: ['0', 'confirm'],
      }
    ),
});

const { r$ } = useRegleSchema({ password: '', nested: [{ confirm: '' }] }, schema);
</script>

<style lang="scss" scoped></style>

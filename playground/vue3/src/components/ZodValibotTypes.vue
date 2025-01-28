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

  <div v-for="(item, index) of r$.$fields.collection.$each" :key="item.$id" class="item">
    <div class="field">
      <input
        v-model="item.$value.child"
        :class="{ valid: item.$fields.child.$valid, error: item.$fields.child.$error }"
        placeholder="Type an item value"
      />

      <div v-if="r$.$value.collection.length > 1" class="delete" @click="r$.$value.collection.splice(index, 1)">🗑️</div>
    </div>

    <ul v-if="item.$fields.child.$errors.length">
      <li v-for="error of item.$fields.child.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>

  Array errors:
  <ul v-if="r$.$fields.collection.$errors.$self.length">
    <li v-for="error of r$.$fields.collection.$errors.$self" :key="error">
      {{ error }}
    </li>
  </ul>

  <button type="button" @click="r$.$value.collection.push({ child: '' })">🆕 Add item</button>
  <button @click="r$.$resetAll">Reset</button>
  <button @click="r$.$validate">Submit</button>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref } from 'vue';
import { z, ZodSchema } from 'zod';
import type { PartialDeep } from 'type-fest';

const zodSchema = z
  .object({
    password: z.string().min(1),
    nested: z
      .object({
        confirm: z
          .string()
          .min(1)
          .refine((value) => value.length > 2, { message: 'Value should > 2' }),
      })
      .refine((data) => data.confirm === 'bar', {
        path: ['confirm'],
        message: 'Value must be "bar"',
      }),
    collection: z
      .array(
        z.object({
          child: z.string().min(1),
        })
      )
      .refine(
        (arg) => {
          return arg.every((v) => v.child?.length === 3);
        },
        {
          message: 'All items children length must be min 3',
        }
      )
      .refine((arg) => arg[0].child === 'foo', {
        message: 'First item must be "foo"',
        path: ['0', 'child'],
      }),
  })
  .refine((data) => data.nested.confirm === data.password, {
    path: ['nested', 'confirm'],
    message: 'Password and confirm must match',
  });

const { r$ } = useRegleSchema({ password: '', nested: { confirm: '' }, collection: [{ child: '' }] }, zodSchema);
</script>

<style lang="scss" scoped></style>

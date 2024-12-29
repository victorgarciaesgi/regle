<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />

    <ul>
      <li v-for="error of r$.$errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.firstName" placeholder="firstname" />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <template v-for="(input, index) of form.nested" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <!-- TODO types for collections errors -->
        <li v-for="error of r$.$errors.nested.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.nested.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested.splice(0, 1)"> Remove first </button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ r$ }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import type { RegleExternalErrorTree } from '@regle/core';
import { useZodRegle } from '@regle/zod';
import { nextTick, reactive, ref } from 'vue';
import { z } from 'zod';

type Form = {
  email: string;
  firstName?: number;
  nested: [{ name: string }];
};

const form = reactive<Form>({
  email: '',
  firstName: 0,
  nested: [{ name: '' }],
});

async function submit() {
  const { result, data } = await r$.$validate();
}

const externalErrors = ref<RegleExternalErrorTree<Form>>({
  email: [''],
});

const { r$ } = useZodRegle(
  form,
  z.object({
    email: z
      .string({ required_error: 'foobar' })
      .min(1)
      .email({ message: 'This must be an email' })
      .refine((val) => val === 'foo@free.fr', 'Bite'),
    firstName: z.coerce.number({ invalid_type_error: 'Not a number', required_error: 'Bite' }).optional(),
    nested: z.array(
      z.object({
        name: z.string().min(1, 'Required'),
      })
    ),
  }),
  { externalErrors }
);
</script>

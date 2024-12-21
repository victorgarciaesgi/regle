<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />

    <ul>
      <li v-for="error of r$.$errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="form.firstName" placeholder="firstname" />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <!-- <template v-for="(input, index) of form.nested" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of r$.$errors.nested.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.nested.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested.splice(0, 1)"> Remove first </button> -->
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
import { useValibotRegle } from '@regle/valibot';
import { nextTick, reactive, ref } from 'vue';
import * as v from 'valibot';

type Form = {
  email: string;
  firstName?: number;
  nested: {
    name?: string;
  };
  collections: [{ name: string }];
};

const form = reactive<Form>({
  email: '',
  firstName: 0,
  nested: {
    name: '',
  },
  collections: [{ name: '' }],
});

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
  }
}

const { r$ } = useValibotRegle(
  form,
  v.object({
    email: v.pipe(v.string(), v.nonEmpty('Please enter your email.')),
    // firstName: v.optional(v.pipe(v.number(), v.minValue(10))),
    nested: v.object({
      // name: v.optional(v.string()),
    }),
    collections: v.pipe(
      v.array(v.object({ name: v.pipe(v.string(), v.nonEmpty('Please enter your email.')) })),
      v.minLength(3)
    ),
  })
);

r$.$fields.email.$value = 'e';
console.log(r$.$fields.firstName?.$value);
</script>

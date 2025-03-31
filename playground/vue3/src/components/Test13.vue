<template>
  <main>
    <div>
      <select v-model="r$.$value.type">
        <option disabled value=""></option>
        <option value="ONE">ONE</option>
        <option value="TWO">TWO</option>
      </select>
    </div>

    <ul v-if="r$.$errors.type?.length">
      <li v-for="error of r$.$errors.type" :key="error">
        {{ error }}
      </li>
    </ul>

    <div v-if="discriminateVariant(r$.$fields, 'type', 'ONE')">
      <input v-model="r$.$fields.firstName.$value" placeholder="firstname" />
      <ul v-if="r$.$errors.firstName?.length">
        <li v-for="error of r$.$errors.firstName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div v-else-if="discriminateVariant(r$.$fields, 'type', 'TWO')">
      <input v-model="r$.$fields.lastName.$value" placeholder="lastName" />
      <ul v-if="r$.$errors.lastName?.length">
        <li v-for="error of r$.$errors.lastName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
    <button class="primary" type="button" @click="r$.$validate">Submit</button>
  </main>
</template>

<script setup lang="ts">
import { createVariant, flatErrors, useRegle, discriminateVariant } from '@regle/core';
import { email, literal, minLength, required } from '@regle/rules';
import JSONViewer from './JSONViewer.vue';
import { ref } from 'vue';

type Form = { name: string } & (
  | { type: 'ONE'; firstName: string }
  | { type: 'TWO'; firstName: number; lastName: string }
  | { type?: undefined }
);

const form = ref<Form>({
  name: '',
});

useRegle(
  { name: '' },
  {
    name: { literal: literal('FOO') },
  }
);

const { r$ } = useRegle(form, () => {
  const variant = createVariant(form, 'type', [
    { type: { literal: literal('ONE') }, firstName: { required } },
    { type: { literal: literal('TWO') }, firstName: { required } },
    { type: { required } },
  ]);

  console.log(variant.value);
  return {
    name: { required },
    ...variant.value,
  };
});

// Problem with property with no rules
if (discriminateVariant(r$.$fields, 'type', 'ONE')) {
  // r$.$fields.firstName.$value
  // r$.$fields.foo
}
</script>

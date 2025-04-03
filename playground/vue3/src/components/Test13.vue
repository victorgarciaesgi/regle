<template>
  <main>
    <div>
      <select v-model="r$.$value.nested2.type">
        <option disabled value=""></option>
        <option value="ONE">ONE</option>
        <option value="TWO">TWO</option>
      </select>
    </div>

    <ul v-if="r$.$errors.nested2.type?.length">
      <li v-for="error of r$.$errors.nested2.type" :key="error">
        {{ error }}
      </li>
    </ul>

    <div v-if="discriminateVariant(r$.$fields.nested2.$fields, 'type', 'ONE')">
      ONE
      <input v-model="r$.$fields.nested2.$fields.firstName.$value" placeholder="firstname" />
      <ul v-if="r$.$errors.nested2.firstName?.length">
        <li v-for="error of r$.$errors.nested2.firstName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div v-else-if="discriminateVariant(r$.$fields.nested2.$fields, 'type', 'TWO')">
      TWO
      <input v-model="r$.$fields.nested2.$fields.lastName.$value" placeholder="lastName" />
      <ul v-if="r$.$errors.nested2.lastName?.length">
        <li v-for="error of r$.$errors.nested2.lastName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
    <button class="primary" type="button" @click="r$.$validate">Submit</button>
  </main>
</template>

<script setup lang="ts">
import {
  createVariant,
  flatErrors,
  useRegle,
  discriminateVariant,
  type RegleComputedRules,
  inferVariantToRef,
} from '@regle/core';
import { email, literal, minLength, required } from '@regle/rules';
import JSONViewer from './JSONViewer.vue';
import { ref } from 'vue';

type Form = {
  nested1: { foo: string };
  nested2: { name: string } & (
    | { type: 'ONE'; details: { quotes: { name: string }[] }; firstName: string }
    | { type: 'TWO'; firstName: number; lastName: string }
    | { type?: undefined }
  );
};
const form = ref<Form>({
  nested1: { foo: '' },
  nested2: {
    name: '',
  },
});

const { r$ } = useRegle(form, () => {
  const variant = createVariant(() => form.value.nested2, 'type', [
    {
      type: { literal: literal('ONE') },
      details: {
        quotes: {
          $each: {
            name: { required },
          },
        },
      },
    },
    { type: { literal: literal('TWO') }, lastName: { required } },
    { type: { required } },
  ]);

  return {
    nested1: {},
    ...variant.value,
  };
});
const lastName = inferVariantToRef(r$.$fields.nested2.$fields, 'type', 'TWO');
// Problem with property with no rules = never

if (discriminateVariant(r$.$fields.nested2.$fields, 'type', 'ONE')) {
  // r$.$fields.nested2.$fields.details.$fields.quotes
  // r$.$fields.nested2.$fields
}
</script>

<template>
  <main>
    <div>
      <select v-model="r$.$value.nested2.type">
        <option disabled value=""></option>
        <option value="ONE">ONE</option>
        <option value="TWO">TWO</option>
      </select>
    </div>

    <input v-model="r$.$fields.nested2.$fields.name.$value" placeholder="firstname" />
    <ul v-if="r$.$fields.nested2.$fields.name.$errors?.length">
      <li v-for="error of r$.$fields.nested2.$fields.name.$errors" :key="error">
        {{ error }}
      </li>
    </ul>

    <ul v-if="r$.$errors.nested2.type?.length">
      <li v-for="error of r$.$errors.nested2.type" :key="error">
        {{ error }}
      </li>
    </ul>

    <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
    <button class="primary" type="button" @click="r$.$validate">Submit</button>
  </main>
</template>

<script setup lang="ts">
import { narrowVariant, useRegle, variantToRef, type Maybe } from '@regle/core';
import { macAddress } from '@regle/rules';
import { ref } from 'vue';

type Form = {
  nested2: { name: 'ONE' } & (
    | { type: 'ONE'; details: { quotes: { name: string }[] }; firstName: string }
    | { type: 'TWO'; firstName: number; lastName: string }
    | { type?: undefined }
  );
};
const form = ref<Form>({
  nested2: {
    name: 'ONE',
  },
});

const { r$ } = useRegle(form, {
  nested2: {
    name: { macAddress: macAddress },
  },
});

// ---cut---
useRegle(
  { name: '' },
  {
    name: {
      required: (value) => true,
    },
  }
);
const nested2TWOFields = variantToRef(r$.$fields.nested2, 'type', 'TWO');
// Problem with property with no rules = never

if (narrowVariant(r$.$fields.nested2.$fields, 'type', 'ONE')) {
  console.log(r$.$fields.nested2.$fields);
  // r$.$fields.nested2.$fields
  // r$.$fields.nested2.$fields
}
</script>

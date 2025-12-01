<script setup lang="ts">
import { markStatic, useRegle, type MaybeInput } from '@regle/core';
import { minValue, withMessage } from '@regle/rules';
import { Decimal } from 'decimal.js';
import JSONViewer from './JSONViewer.vue';

const { r$ } = useRegle(
  {
    number: 0,
    decimal: markStatic(new Decimal(0)),
  },
  {
    decimal: {
      minDecimal: withMessage((value: MaybeInput<Decimal>) => {
        console.log(value);
        return minValue(10).exec(value?.toNumber() ?? 0);
      }, 'Min value must be 10'),
    },
  }
);

function handleDecimalInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (!isNaN(parseFloat(value))) {
    r$.$value.decimal = new Decimal(parseFloat(value));
  } else {
    r$.decimal.$value = undefined;
  }
}

const { data } = await r$.$validate();
</script>

<template>
  <div class="px-6 text-gray-900 antialiased">
    <div class="mx-auto max-w-xl py-4 md:max-w-4xl space-y-2">
      <h2 class="text-2xl mb-4">Regle reproduction</h2>
      <div class="flex flex-col">
        <label>Number</label>
        <input class="border p-2 rounded" v-model="r$.number.$value" placeholder="Victor Regle" />
        <ul class="text-red-400 text-sm mt-1" v-if="r$.$errors.number.length">
          <li v-for="error of r$.$errors.number" :key="error">{{ error }}</li>
        </ul>
      </div>
      <div class="flex flex-col">
        <label>Decimal</label>
        <input
          class="border p-2 rounded"
          :value="r$.decimal.$value?.toString()"
          @input="handleDecimalInput"
          placeholder="Product..."
        />
        <ul class="text-red-400 text-sm mt-1" v-if="r$.$errors.decimal.length">
          <li v-for="error of r$.decimal.$errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <JSONViewer :data="r$" />
    </div>
  </div>
</template>

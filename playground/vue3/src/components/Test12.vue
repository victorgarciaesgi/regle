<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { defineRegleConfig, type RegleStaticImpl } from '@regle/core';
import { required, minLength, email, withMessage, fileType } from '@regle/rules';
import { Decimal } from 'decimal.js';

const state = ref({ decimal: null as RegleStaticImpl<Decimal> | null });

const { useRegle } = defineRegleConfig({
  overrides: {
    isEdited: (currentValue, initialValue, defaultHandlerFn) => {
      console.log('currentValue', currentValue);
      console.log('initialValue', initialValue);
      if (currentValue instanceof Decimal && initialValue instanceof Decimal) {
        return currentValue.toString() !== initialValue.toString();
      }
      return defaultHandlerFn(currentValue, initialValue);
    },
  },
});

const { r$ } = useRegle(state, {
  decimal: {
    required,
  },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  // if (valid) {
  //   console.log(data.name)
  //   //               ^ string
  //   console.log(data.email)
  //   //.              ^ string | undefined
  // } else {
  //   console.warn('Errors: ', r$.$errors)
  // }
}
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">Files. Edited?: {{ r$.decimal.$edited }}</label>

      <input
        class="form-control"
        :value="r$.decimal.$value"
        @input="r$.decimal.$value = new Decimal($event.target.value)"
      />
      <ul>
        <li v-for="error of r$.decimal.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset()">Restart</button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

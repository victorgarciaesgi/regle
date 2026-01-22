<script setup lang="ts">
  import { nextTick, ref } from 'vue';
  import { defineRegleConfig, useRegle, type RegleStaticImpl } from '@regle/core';
  import { required, minLength, email, withMessage, fileType } from '@regle/rules';
  import { Decimal } from 'decimal.js';
  import { markStatic } from '@regle/core';

  const state = ref({ decimal: null as RegleStaticImpl<Decimal> | null });

  const { r$ } = useRegle(state, {
    decimal: {
      required,
      $isEdited: (currentValue, initialValue, defaultHandlerFn) => {
        if (currentValue && initialValue) {
          return currentValue.toString() !== initialValue.toString();
        }
        return defaultHandlerFn(currentValue, initialValue);
      },
    },
  });

  function handleDecimalInput(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      if (event.target.value) {
        r$.decimal.$value = markStatic(new Decimal(event.target.value));
      } else {
        r$.decimal.$value = undefined;
      }
    }
  }

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
    <div class="py-2 has-validation">
      <label class="form-label">Files. Edited?: {{ r$.decimal.$edited }}</label>

      <input class="form-control" :value="r$.decimal.$value" @input="handleDecimalInput" />
      <ul>
        <li v-for="error of r$.decimal.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset()">Restart</button>

    <pre>{{ r$.decimal }}</pre>

    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.name"
        :class="{ valid: r$.$fields.name.$valid, error: r$.$fields.name.$error }"
        placeholder="Type your name"
      />

      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>

    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useValibotRegle } from '@regle/valibot';
import * as v from 'valibot';

const { r$ } = useValibotRegle(
  { name: '' },
  v.object({
    name: v.pipe(v.string(), v.minLength(3)),
  })
);
</script>

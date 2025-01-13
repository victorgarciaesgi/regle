<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.name"
        :class="{ valid: r$.$fields.name.$valid, error: r$.$fields.name.$error }"
        placeholder="Type your name"
      />

      <button type="button" @click="r$.$resetAll">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
    </div>

    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useZodRegle } from '@regle/zod';
import { z } from 'zod';

const { r$ } = useZodRegle(
  { name: '' },
  z.object({
    name: z.string().min(1),
  })
);
</script>

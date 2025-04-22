<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.name"
        :class="{ valid: r$.$fields.name.$correct, error: r$.$fields.name.$error }"
        placeholder="Type your name"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>

    <ul v-if="r$.$errors.name.length">
      <li v-for="error of r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';
import { type } from 'arktype';

const schema = type({
  'firstName?': 'string',
  lastName: 'string > 3',
}).narrow((data, ctx) => {
  if (data.firstName !== data.lastName) {
    return true;
  }
  return ctx.reject({
    expected: 'different to firstName',
    path: ['lastName'],
  });
});

const { r$ } = useRegleSchema(
  { name: '' },
  z.object({
    name: z.string().min(1),
  })
);
</script>

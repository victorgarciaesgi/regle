<template>
  <div class="demo-container">
    <div class="row">
      <div class="input-container">
        <input
          v-model="r$.$value.firstName"
          :class="{ valid: r$.$fields.firstName.$correct, error: r$.$fields.firstName.$error }"
          placeholder="Type your first name"
        />
        <ul v-if="r$.$errors.firstName.length">
          <li v-for="error of r$.$errors.firstName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div class="input-container">
        <input
          v-model="r$.$value.lastName"
          :class="{ valid: r$.$fields.lastName.$correct, error: r$.$fields.lastName.$error }"
          placeholder="Type your last name"
        />
        <ul v-if="r$.$errors.lastName.length">
          <li v-for="error of r$.$errors.lastName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <div class="button-list">
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod';

const state = ref({ firstName: '', lastName: '' });

const { r$ } = useRegleSchema(
  state,
  z.object({
    firstName: z.string().min(1).catch('Victor'),
    lastName: z.string().transform((value) => `Transformed ${value}`),
  }),
  { syncState: { onValidate: true } }
);
</script>

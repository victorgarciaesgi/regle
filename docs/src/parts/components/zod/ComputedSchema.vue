<template>
  <div class="demo-container">
    <div class="row">
      <div class="input-container">
        <input
          v-model="form.firstName"
          :class="{ valid: r$.$fields.firstName.$valid, error: r$.$fields.firstName.$error }"
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
          v-model="form.lastName"
          :class="{ valid: r$.$fields.lastName.$valid, error: r$.$fields.lastName.$error }"
          placeholder="Type your last name"
        />
        <ul v-if="r$.$errors.lastName.length">
          <li v-for="error of r$.$errors.lastName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZodRegle, type toZod } from '@regle/zod';
import { z } from 'zod';
import { ref, computed } from 'vue';

const form = ref({ firstName: '', lastName: '' });

const schema = computed(() =>
  z.object({
    firstName: z.string(),
    lastName: z.string().refine((v) => v !== form.value.firstName, {
      message: "Last name can't be equal to first name",
    }),
  })
);

const { r$, resetAll } = useZodRegle(form, schema);
</script>

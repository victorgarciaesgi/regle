<template>
  <div class="demo-container">
    <div class="row">
      <div class="input-container">
        <input
          v-model="form.firstName"
          :class="{ valid: regle.$fields.firstName.$valid, error: regle.$fields.firstName.$error }"
          placeholder="Type your first name"
        />
        <ul v-if="errors.firstName.length">
          <li v-for="error of errors.firstName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div class="input-container">
        <input
          v-model="form.lastName"
          :class="{ valid: regle.$fields.lastName.$valid, error: regle.$fields.lastName.$error }"
          placeholder="Type your last name"
        />
        <ul v-if="errors.lastName.length">
          <li v-for="error of errors.lastName" :key="error">
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

const { errors, regle, resetAll } = useZodRegle(form, schema);
</script>

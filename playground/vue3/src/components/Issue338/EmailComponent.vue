<script setup lang="ts" generic="T extends Record<string, unknown>">
  import { flatErrors } from '@regle/core';
  import type { RegleSchemaFieldStatus, MaybeSchemaVariantStatus } from '@regle/schemas';

  const { field, options } = defineProps<{
    options: T[];
    field: RegleSchemaFieldStatus<T | null> | MaybeSchemaVariantStatus<T>;
  }>();

  const [model] = defineModel<T | null>({ required: true });
</script>

<template>
  <div>
    <h3>Email</h3>

    <select v-model="model" name="emails" id="email-select">
      <option :value="null">--Please choose an option--</option>

      <template v-for="option of options">
        <option :value="option">{{ option }}</option>
      </template>
    </select>

    <ul v-if="field.$error" style="font-size: 12px; color: red">
      <li v-for="error of flatErrors(field.$errors)" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

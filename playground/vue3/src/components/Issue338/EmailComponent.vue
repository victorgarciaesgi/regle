<script setup lang="ts">
  import { flatErrors } from '@regle/core';
  import type { MaybeSchemaVariantStatus, RegleSchemaFieldStatus, RegleSchemaStatus } from '@regle/schemas';

  import { type Email } from './Issue338.vue';

  const { field, options } = defineProps<{
    field: RegleSchemaFieldStatus<Email> | MaybeSchemaVariantStatus<Email>;
    options: Email[];
  }>();

  const [model] = defineModel<Email | null>({ required: true });
</script>

<template>
  <div>
    <h3>Email</h3>

    <select v-model="model" name="emails" id="email-select">
      <option :value="null">--Please choose an option--</option>

      <template v-for="option of options">
        <option :value="option">{{ option.label }}</option>
      </template>
    </select>

    <ul v-if="model !== null">
      <li>
        id: <b>{{ model.id }}</b>
      </li>
      <li>
        label: <b>{{ model.label }}</b>
      </li>
    </ul>

    <ul v-if="field.$error" style="font-size: 12px; color: red">
      <li v-for="error of flatErrors(field.$errors)" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

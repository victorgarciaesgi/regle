<script
  setup
  lang="ts"
  generic="
    FieldInput,
    Input extends Record<string, any>,
    FieldOutput,
    Output extends Record<string, any>,
    OutputOption extends Output[keyof Output]
  "
>
  import { flatErrors } from '@regle/core';
  import type { RegleSchemaFieldStatus, RegleSchemaStatus } from '@regle/schemas';

  const { field, name, options } = defineProps<{
    field: RegleSchemaFieldStatus<FieldInput, FieldOutput | null> | RegleSchemaStatus<Input, Output>;
    name: string;
    options: FieldOutput[] | OutputOption[];
  }>();

  const [model] = defineModel<FieldInput | Input | null>({ required: true });
</script>

<template>
  <div>
    <h3>{{ name }}</h3>

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

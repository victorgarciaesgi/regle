<template>
  <div>
    <input v-model="field.$value" type="password" />
    <ul>
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle, type RegleFieldStatus } from '@regle/core';
  import { required, minLength, email, containsUppercase } from '@regle/rules';

  const props = defineProps<{
    password: string;
    field: RegleFieldStatus<string>;
  }>();

  props.field.addRules({ required, minLength: minLength(8), containsUppercase: containsUppercase });
</script>

<template>
  <div :class="{ block: !!label }" class="demo-field">
    <div class="demo-field-input">
      <label v-if="label">
        <code>{{ label }}</code>
      </label>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="type"
        :class="{ valid: field?.$correct, error: field?.$error }"
        :placeholder="placeholder"
      />
    </div>
    <ul v-if="field?.$errors.length">
      <li v-for="error of field?.$errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import type { RegleFieldStatus } from '@regle/core';

  const { type = 'text', ...props } = defineProps<{
    field?: RegleFieldStatus<any>;
    modelValue?: any;
    placeholder?: string;
    label?: string;
    type?: string;
  }>();

  defineEmits<{
    'update:modelValue': [value: any];
  }>();
</script>

<style scoped lang="scss">
  .demo-field {
    display: flex;
    flex-flow: column nowrap;
    gap: 16px;

    &.block:not(:last-child) {
      margin-bottom: 16px;
    }

    &-input {
      display: flex;
      flex-flow: column nowrap;
      gap: 4px;
    }

    input {
      width: 100%;
    }
  }
</style>

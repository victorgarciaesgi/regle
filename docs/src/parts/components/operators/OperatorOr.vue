<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.regex"
        :class="{ valid: regle.$fields.regex.$valid }"
        placeholder="Type your regex"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <ul v-if="errors.regex.length">
      <li v-for="error of errors.regex" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { or, startsWith, endsWith, withMessage } from '@regle/rules';

const { state, errors, regle, resetAll } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        or(startsWith('^'), endsWith('$')),
        (value, { $params: [start, end] }) =>
          `Field should start with "${start}" or end with "${end}"`
      ),
    },
  }
);
</script>

<style lang="scss" scoped></style>

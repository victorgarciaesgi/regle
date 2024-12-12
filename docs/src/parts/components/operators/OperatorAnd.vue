<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.regex"
        :class="{ valid: r$.$fields.regex.$valid, error: r$.$fields.regex.$error }"
        placeholder="Type your regex"
      />

      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
    
    <ul v-if="r$.$errors.regex.length">
      <li v-for="error of r$.$errors.regex" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { and, startsWith, endsWith, withMessage } from '@regle/rules';

const { r$ } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        and(startsWith('^'), endsWith('$')),
        ({ $params: [start, end] }) => `Field should start with "${start}" and end with "${end}"`
      ),
    },
  }
);
</script>

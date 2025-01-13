<template>
  <div class="demo-container">
    <div>
      <input v-model="r$.$value.regex" :class="{ valid: r$.$fields.regex.$valid }" placeholder="Type your regex" />
      <button type="button" @click="r$.$resetAll">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
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
import { or, startsWith, endsWith, withMessage } from '@regle/rules';

const { r$ } = useRegle(
  { regex: '' },
  {
    regex: {
      myError: withMessage(
        or(startsWith('^'), endsWith('$')),
        ({ $params: [start, end] }) => `Field should start with "${start}" or end with "${end}"`
      ),
    },
  }
);
</script>

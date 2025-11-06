<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.regex"
        :class="{ valid: r$.regex.$correct, error: r$.regex.$error }"
        placeholder="Type your regex"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
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
        ({ $params: [start, end] }) => `Regex should start with "${start}" and end with "${end}"`
      ),
    },
  }
);
</script>

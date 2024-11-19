<template>
  <div class="demo-container">
    <div style="display: flex; gap: 8px; align-items: flex-start">
      <div>
        <input v-model="state.password" type="password" placeholder="Type your password" />
        <ul v-if="errors.password.length">
          <li v-for="error of errors.password" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div>
        <input
          v-model="state.confirm"
          type="password"
          :class="{ error: regle.$fields.confirm.$error }"
          placeholder="Confirm your password"
        />
        <ul v-if="errors.confirm.length">
          <li v-for="error of errors.confirm" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { not, required, sameAs, withMessage } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ password: '', confirm: '' });
const { state, errors, regle, resetAll } = useRegle(form, {
  password: {
    required,
  },
  confirm: {
    notEqual: withMessage(
      not(sameAs(() => form.value.password)),
      'Your confirm password must not be the same as your password'
    ),
  },
});
</script>

<style lang="scss" scoped></style>

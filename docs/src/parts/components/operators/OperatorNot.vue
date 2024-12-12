<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input v-model="r$.$value.password" type="password" placeholder="Type your password" />

        <ul v-if="r$.$errors.password.length">
          <li v-for="error of r$.$errors.password" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <input
          v-model="r$.$value.confirm"
          type="password"
          :class="{ error: r$.$fields.confirm.$error }"
          placeholder="Confirm your password"
        />

        <ul v-if="r$.$errors.confirm.length">
          <li v-for="error of r$.$errors.confirm" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      
      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { not, required, sameAs, withMessage } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ password: '', confirm: '' });
const { r$ } = useRegle(form, {
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

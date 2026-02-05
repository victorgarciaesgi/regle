<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input v-model="r$.$value.oldPassword" type="password" placeholder="Type your old password" />

        <ul v-if="r$.$errors.oldPassword.length">
          <li v-for="error of r$.$errors.oldPassword" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div class="field">
        <input
          v-model="r$.$value.newPassword"
          type="password"
          :class="{ error: r$.newPassword.$error }"
          placeholder="Type your new password"
        />

        <ul v-if="r$.$errors.newPassword.length">
          <li v-for="error of r$.$errors.newPassword" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
        <button class="primary" type="button" @click="r$.$validate()">Submit</button>
        <code class="status" :status="r$.$correct"></code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { not, required, sameAs, withMessage } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref({ oldPassword: '', newPassword: '' });
  const { r$ } = useRegle(form, {
    oldPassword: {
      required,
    },
    newPassword: {
      notEqual: withMessage(not(sameAs(() => form.value.oldPassword)), 'Your passwords must be different'),
    },
  });
</script>

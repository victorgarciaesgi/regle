<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input
          v-model="form.email"
          :class="{ valid: r$.$fields.email.$correct, error: r$.$fields.email.$error }"
          placeholder="Type your email"
        />

        <ul v-if="r$.$errors.email.length">
          <li v-for="error of r$.$errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <input
          v-model="form.name.pseudo"
          :class="{
            valid: r$.$fields.name.$correct,
            error: r$.$fields.name.$fields.pseudo.$error,
          }"
          placeholder="Type your pseudo"
        />

        <ul v-if="r$.$errors.name.pseudo.length">
          <li v-for="error of r$.$errors.name.pseudo" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div class="button-list">
      <button type="button" @click="r$.$clearExternalErrors">Reset external Errors</button>
      <button type="button" @click="() => r$.$reset({ toInitialState: true, clearExternalErrors: true })"
        >Reset All</button
      >
      <button class="primary" type="button" @click="submit">Submit</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { ref, reactive } from 'vue';
import { type RegleExternalErrorTree, useRegle } from '@regle/core';

const form = ref({
  email: '',
  name: {
    pseudo: '',
  },
});

const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const { r$ } = useRegle(
  form,
  {
    email: { required },
    name: { pseudo: { required } },
  },
  {
    externalErrors,
  }
);

function submit() {
  r$.$validate();
  externalErrors.value = {
    email: ['Email already exists'],
    name: {
      pseudo: ['Pseudo already exists'],
    },
  };
}
</script>

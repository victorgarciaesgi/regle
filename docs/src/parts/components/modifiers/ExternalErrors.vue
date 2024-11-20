<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input
          v-model="form.email"
          :class="{ valid: regle.$fields.email.$valid, error: regle.$fields.email.$error }"
          placeholder="Type your email"
        />
        <ul v-if="errors.email.length">
          <li v-for="error of errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div>
        <input
          v-model="form.name.pseudo"
          :class="{
            valid: regle.$fields.name.$valid,
            error: regle.$fields.name.$fields.pseudo.$error,
          }"
          placeholder="Type your pseudo"
        />
        <ul v-if="errors.name.pseudo.length">
          <li v-for="error of errors.name.pseudo" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div>
        <button type="button" @click="submit">Submit</button>
        <button type="button" @click="regle.$clearExternalErrors">Reset Errors</button>
        <button type="button" @click="resetAll">Reset All</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from '@regle/rules';
import { ref, reactive } from 'vue';
import { type RegleExternalErrorTree, useRegle } from '@regle/core';

const form = reactive({
  email: '',
  name: {
    pseudo: '',
  },
});

const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const { errors, resetAll, regle } = useRegle(
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
  externalErrors.value = {
    email: ['Email already exists'],
    name: {
      pseudo: ['Pseudo already exists'],
    },
  };
}
</script>

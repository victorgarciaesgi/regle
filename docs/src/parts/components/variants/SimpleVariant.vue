<template>
  <form class="demo-container">
    <div class="row">
      <div>
        <input v-model="r$.firstName.$value" placeholder="First name" />
        <ul v-if="r$.firstName.$errors">
          <li v-for="error of r$.firstName.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <select v-model="r$.type.$value">
          <option :value="undefined" selected>Account type</option>
          <option value="EMAIL">Email</option>
          <option value="GITHUB">Github</option>
        </select>
        <ul v-if="r$.type.$errors">
          <li v-for="error of r$.type.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div class="row">
      <div v-if="narrowVariant(r$.$fields, 'type', 'EMAIL')">
        <!-- `email` is now a known field in this block -->
        <input v-model="r$.email.$value" placeholder="Email" />
        <ul v-if="r$.email.$errors">
          <li v-for="error of r$.email.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div v-else-if="narrowVariant(r$.$fields, 'type', 'GITHUB')">
        <!-- `username` is now a known field in this block -->
        <input v-model="r$.username.$value" placeholder="Github" />
        <ul v-if="r$.username.$errors">
          <li v-for="error of r$.username.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div class="button-list">
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRegle, createVariant, narrowVariant } from '@regle/core';
import { literal, required, email } from '@regle/rules';

type FormStateLoginType =
  | { type: 'EMAIL'; email: string }
  | { type: 'GITHUB'; username: string }
  | { type?: undefined };

type FormState = {
  firstName?: string;
  lastName?: string;
} & FormStateLoginType;

const state = ref<FormState>({});

const { r$ } = useRegle(state, () => {
  const variant = createVariant(state, 'type', [
    { type: { literal: literal('EMAIL') }, email: { required, email } },
    { type: { literal: literal('GITHUB') }, username: { required } },
    { type: { required } },
  ]);

  return {
    firstName: { required },
    ...variant.value,
  };
});

function submit() {}
</script>

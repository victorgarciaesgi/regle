<script setup lang="ts">
  import { ref } from 'vue';
  import { createRule, useRegle, type Maybe } from '@regle/core';
  import { required } from '@regle/rules';

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  /** Simulates a server check: waits 2s, then fails if the value contains "taken". */
  const checkUsernameAvailable = createRule({
    async validator(value: Maybe<string>) {
      if (!value?.trim()) {
        return true;
      }
      await delay(2000);
      return !value.toLowerCase().includes('taken');
    },
    message: 'This username is already taken',
  });

  const state = ref({ username: '' });

  const { r$ } = useRegle(state, {
    username: { required, checkUsernameAvailable },
  });

  async function submit() {
    const { valid, data } = await r$.$validate();
    if (valid) {
      console.log('OK', data.username);
    } else {
      console.warn('Errors:', r$.$errors);
    }
  }
</script>

<template>
  <div class="container p-3">
    <h2>Async validation (2s)</h2>
    <p class="text-muted small">
      Type a value containing <code>taken</code> to fail after the delay. Watch <code>$pending</code> while the mock
      request runs.
    </p>

    <div class="py-2 has-validation">
      <label class="form-label">Username</label>
      <div class="input-group">
        <input
          class="form-control"
          v-model="r$.$value.username"
          placeholder="Try “available” vs “taken-user”"
          :class="{
            'is-valid': r$.username.$correct && !r$.username.$pending,
            'is-invalid': r$.username.$error,
            'border-warning': r$.username.$pending,
          }"
          aria-describedby="username-feedback"
        />
        <span v-if="r$.username.$pending" class="input-group-text text-warning" id="username-pending"> Pending… </span>
      </div>
      <div id="username-feedback" class="form-text">
        <span v-if="r$.username.$pending" class="text-warning">Async check in progress (2s)…</span>
        <span v-else> Field <code>$pending</code>: {{ r$.username.$pending }} </span>
      </div>
      <ul class="invalid-feedback d-block">
        <li v-for="error of r$.$errors.username" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button class="btn btn-primary m-2" :disabled="r$.username.$pending" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })">Restart</button>
    <code class="status ms-2">
      Form {{ r$.$correct ? '✅' : '❌' }} · username pending: {{ r$.username.$pending }}
    </code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

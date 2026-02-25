<script setup lang="ts">
  import { ref } from 'vue';
  import { useRegle } from '@regle/core';
  import { required, minLength, email } from '@regle/rules';

  const externalErrors = ref<string[]>([]);

  const { r$ } = useRegle(
    '',
    {
      required,
      minLength: minLength(4),
    },
    {
      id: 'test-12',
      externalErrors,
    }
  );

  async function submit() {
    const { valid, data } = await r$.$validate();
    externalErrors.value = ['test error'];
  }
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">Name</label>
      <input
        class="form-control"
        v-model="r$.$value"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.$correct,
          'is-invalid': r$.$error,
        }"
        aria-describedby="name-error"
      />
      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

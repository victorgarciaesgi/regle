<script setup lang="ts">
  import { ref } from 'vue';
  import { useRegle, useRules } from '@regle/core';
  import { required, minLength, email, string } from '@regle/rules';
  import { useRegleSchema } from '@regle/schemas';

  const state = ref({ name: '', email: '' });

  const externalErrors = ref({});

  const schema = useRules({ username: { required, string: string } });

  const { r$ } = useRegleSchema({ username: '' }, schema);

  async function submit() {
    const { valid, data } = await r$.$validate();
    console.log('valid', valid);
    if (valid) {
      externalErrors.value = {
        name: ['Name is required'],
        email: ['Email is required'],
      };
      // console.log(data.name);
      // //               ^ string
      // console.log(data.email);
      //.              ^ string | undefined
    } else {
      console.warn('Errors: ', r$.$errors);
    }
  }
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <!-- <div class="py-2 has-validation">
      <label class="form-label">Name</label>
      <input
        class="form-control"
        v-model="r$.$value.name"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.name.$correct,
          'is-invalid': r$.name.$error,
        }"
        aria-describedby="name-error"
      />
      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.name" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="py-2 has-validation">
      <label class="form-label">Email (optional)</label>
      <input
        class="form-control"
        v-model="r$.$value.email"
        placeholder="Type your email"
        :class="{
          'is-valid': r$.email.$correct,
          'is-invalid': r$.email.$error,
        }"
        aria-describedby="email-error"
      />
      <ul id="email-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.email" :key="error">
          {{ error }}
        </li>
      </ul>
    </div> -->

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

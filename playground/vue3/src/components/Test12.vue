<script setup lang="ts">
  import { ref } from 'vue';
  import { useRegle, type DumbJoinDiscriminatedUnions, type JoinDiscriminatedUnions } from '@regle/core';
  import { required, minLength, email, pipe, withAsync, isFilled, atLeastOne } from '@regle/rules';
  import { timeout } from './validations';

  type State = ({ name: string } | { address: string }) & { email?: string };

  type bar = JoinDiscriminatedUnions<State>;

  const state = ref<State>({ name: '', email: '' });

  const { r$ } = useRegle(state, {
    address: { required },
  });

  r$.$fields;
  r$.address?.$value;

  r$.$fields.email?.$value;

  async function submit() {
    const { valid, data } = await r$.$validate();
    if (valid) {
      console.log(data.name);
      //               ^ string
      // console.log(data.email);
      //.              ^ string | undefined
    } else {
      console.warn('Errors: ', r$.$errors);
    }
  }

  function updateUser() {
    // r$.user.$value = {};
  }
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">Name</label>
      <input
        class="form-control"
        v-model="r$.$value.name"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.name?.$correct,
          'is-invalid': r$.name?.$error,
        }"
        aria-describedby="name-error"
      />
      <pre v-if="r$.name?.$pending">Pending...</pre>
      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.name" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <!-- <div class="py-2 has-validation">
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
    <button class="btn btn-primary m-2" @click="updateUser">Update User</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { type Maybe, useRegle } from '@regle/core';
import { required, minLength, email, withAsync, withMessage, isFilled } from '@regle/rules';

const state = ref({ name: '', email: '' });

function verifyEmailAlreadyUsed(value: Maybe<string>): Promise<boolean> {
  if (isFilled(value)) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(value === 'test@test.com'), 1000);
    });
  }
  return Promise.resolve(true);
}

const { r$ } = useRegle(state, {
  email: {
    // email,
    alreadyUsed: withMessage(async (value) => await verifyEmailAlreadyUsed(value), 'Already used'),
  },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    console.log(data.name);
    //               ^ string
    console.log(data.email);
    //.              ^ string | undefined
  } else {
    console.warn('Errors: ', r$.$errors);
  }
}
</script>

<template>
  <h2>Hello Regle!</h2>
  <label>Email (optional)</label><br />
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul>
    <li :style="r$.email.$pending ? 'color: orange' : ''"> Pending: {{ r$.email.$pending }} </li>
    <li :style="r$.email.$error ? 'color: red' : ''"> Error: {{ r$.email.$error }} </li>
    <li :style="r$.email.$correct ? 'color: green' : ''"> Correct: {{ r$.email.$correct }} </li>
  </ul>
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

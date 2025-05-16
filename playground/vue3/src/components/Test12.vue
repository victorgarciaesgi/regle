<script setup lang="ts">
import { ref } from 'vue';
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const state = ref({ name: '', email: '' });

const externalErrors = ref({});

const { r$ } = useRegle(
  state,
  {
    email: { email },
  },
  {
    externalErrors,
    autoDirty: true,
    rewardEarly: true, // CHANGE THIS
    clearExternalErrorsOnChange: true,
    lazy: false,
  }
);

const mimicExternalData = () => {
  setTimeout(() => {
    externalErrors.value = {
      name: ['Example validation issue'],
    };
  }, 500);
};

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    mimicExternalData();
  } else {
    alert('Invalid');
  }
}
</script>

<template>
  <h2>Hello Regle!</h2>

  <label>Name</label><br />
  <input v-model="r$.$value.name" placeholder="Type your name" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.name" :key="error">
      {{ error }}
    </li>
  </ul>

  <label>Email (optional)</label><br />
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
  <button @click="r$.$reset()">Reset</button>
  <button @click="r$.$reset({ toState: { name: '', email: '' } })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

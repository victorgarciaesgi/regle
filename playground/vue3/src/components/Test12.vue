<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRegle, defineRegleConfig } from '@regle/core';
import { required, minLength, email, assignIf, withMessage } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    customRule: withMessage(required, 'You need to provide a value'),
  }),
});

const state = reactive({ name: '', email: '', condition: false });

const { r$ } = useCustomRegle(state, () => ({
  name: assignIf(() => state.condition, {}),
  email: { email },
}));

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

  <input type="checkbox" v-model="state.condition" /> Enable condition <br />
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
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

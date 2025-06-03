import type { InjectionKey, Ref } from 'vue';

export const AppVue = `
<script setup lang="ts">
import {ref} from 'vue';
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const state = ref({name: '', email: ''})

const {r$} = useRegle(state, {
  name: { required, minLength: minLength(4) },
  email: { email }
})

async function submit() {
  const {valid, data} = await r$.$validate();
  if (valid) {
    console.log(data.name)
    //               ^ string
    console.log(data.email)
    //.              ^ string | undefined
  } else {
    console.warn('Errors: ', r$.$errors)
  }
}
</script>

<template>
  <h2>Hello Regle!</h2>

    <label>Name</label><br/>
    <input v-model="r$.$value.name" placeholder="Type your name" />
    <ul style='font-size: 12px; color: red'>
      <li v-for="error of r$.$errors.name" :key="error">
        {{error}}
      </li>
    </ul>

    <label>Email (optional)</label><br/>
    <input v-model="r$.$value.email" placeholder="Type your email" />
    <ul style='font-size: 12px; color: red'>
      <li v-for="error of r$.$errors.email" :key="error">
        {{error}}
      </li>
    </ul>

    <button @click="submit">Submit</button>
    <button @click="r$.$reset({toInitialState: true})">Restart</button>
    <code class="status"> Form status {{r$.$correct ? '✅' : '❌'}}</code>
</template>
`.trimStart();

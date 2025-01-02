<template>
  <!-- <TestForm /> -->
  <!-- <ValibotForm /> -->
  <ZodForm />
  <!-- <Test13 /> -->
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Test13 from './components/Test13.vue';
import ValibotForm from './components/ValibotForm.vue';
import ZodForm from './components/ZodForm.vue';
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const state = ref({ name: '', email: '' });

const { r$ } = useRegle(state, {
  name: { required, minLength: minLength(4) },
  email: { email },
});

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    console.log(data.name);
    //               ^ string
    console.log(data.email);
    //.              ^ string | undefined
  } else {
    console.warn('Errors: ', r$.$errors);
  }
}
</script>

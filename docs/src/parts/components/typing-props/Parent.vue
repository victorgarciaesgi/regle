<template>
  <form class="demo-container">
    <div class="row">
      <MyInput v-model="r$.$value.name" :field="r$.$fields.name" placeholder="Type your name" />
      <MyInput v-model="r$.$value.email" :field="r$.$fields.email" placeholder="Type your email" />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import MyInput from './MyInput.vue';
import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '', email: '' },
  {
    name: { required },
    email: { required, email },
  }
);
</script>

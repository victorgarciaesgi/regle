<template>
  <form class="demo-container">
    <div class="row">
      <MyInput v-model="state.name" :field="r$.$fields.name" placeholder="Type your name" />
      <MyInput v-model="state.email" :field="r$.$fields.email" placeholder="Type your email" />
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import MyInput from './MyInput.vue';
import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';

const { r$, state, resetAll } = useRegle(
  { name: '', email: '' },
  {
    name: { required },
    email: { required, email },
  }
);
</script>

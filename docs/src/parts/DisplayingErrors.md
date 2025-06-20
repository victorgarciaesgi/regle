``` vue twoslash [App.vue]
<template>
  <input 
    :class="{
      error: r$.email.$error,
      valid: r$.email.$correct
    }" 
    v-model='r$.$value.email' 
    placeholder='Type your email'
  />

  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';
import { ref } from 'vue';

const { r$ } = useRegle({ email: '' }, {
  email: { required, minLength: minLength(4), email }
})
</script>

<style>
input.error {
  border-color: red;
}

input.valid {
  border-color: green;
}
</style>
```



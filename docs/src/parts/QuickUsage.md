``` vue twoslash [App.vue]
<template>
  <input 
     v-model='r$.$value.email' 
    :class="{ error: r$.email.$error }" 
    placeholder='Type your email'
  />

  <li v-for="error of r$.$errors.email" :key='error'>
    {{ error }}
  </li>
</template>

<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { required, email, minLength: minLength(4)}
})
</script>
```

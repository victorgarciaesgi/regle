``` vue twoslash [App.vue]
<template>
  <input 
    :class="{
      error: regle.$fields.email.$error,
      valid: regle.$fields.email.$valid
    }" 
    v-model='state.email' 
    placeholder='Type your email'/>
  <ul>
    <li v-for="error of errors.email" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/rules';
import {ref} from 'vue';

const {errors, state, regle} = useRegle({email: ''}, {
  email: {required, minLength: minLength(4), email}
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


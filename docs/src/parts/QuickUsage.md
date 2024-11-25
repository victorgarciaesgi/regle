``` vue twoslash [App.vue]
<template>
  <input v-model='state.email' placeholder='Type your email'/>
  <ul>
    <li v-for="error of r$.$errors.email" :key='error'>
      //                            ^?
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/rules';

const {r$, state} = useRegle({email: ''}, {
  email: {required, minLength: minLength(4), email}
})

</script>
```

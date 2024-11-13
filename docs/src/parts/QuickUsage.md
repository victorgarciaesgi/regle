``` vue twoslash
<template>
  <input v-model='state.email' placeholder='Type your email'/>
  <ul>
    <li v-for="error of errors.email">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/rules';
import {ref} from 'vue';


const {errors, state} = useRegle({email: ''}, {
  email: {required, minLength: minLength(4), email}
})

</script>
```

Result:

<div class="demo-container">
  <div>
    <input v-model='state.email' placeholder='Type your email'/>
    <button type="button" @click="resetAll">Reset</button>
  </div>
  <ul v-if="errors.email.length">
    <li v-for="error of errors.email">
      {{ error }}
    </li>
  </ul>
</div>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/rules';
import {ref} from 'vue';

const {errors, state, resetAll} = useRegle({email: ''}, {
  email: {required, minLength: minLength(4), email}
})
</script>

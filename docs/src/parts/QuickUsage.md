``` vue twoslash
<template>
  <input v-model='form.email' placeholder='Type your email'/>
  <ul>
    <li v-for="error of errors.email">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/validators';
import {ref} from 'vue';

const form = ref({email: ''});

const {errors} = useRegle(form, {
  email: {required, minLength: minLength(4), email}
})

</script>
```

Result:

<div class="demo-container">
  <div>
    <input v-model='form.email' placeholder='Type your email'/>
    <button type="button" @click="resetForm">Reset</button>
  </div>
  <ul v-if="errors.email.length">
    <li v-for="error of errors.email">
      {{ error }}
    </li>
  </ul>
</div>

<script setup lang='ts'>
import {useRegle} from '@regle/core';
import {required, minLength, email} from '@regle/validators';
import {ref} from 'vue';

const form = ref({email: ''});

const {errors, resetForm} = useRegle(form, {
  email: {required, minLength: minLength(4), email}
})
</script>

<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.firstName"
        :class="{
          error: r$.firstName.$error,
          valid: r$.firstName.$correct,
        }"
        placeholder="Type your firstname"
      />
    </div>

    <ul v-if="r$.$errors.firstName.length">
      <li v-for="error of r$.$errors.firstName" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { required } from '@regle/rules';
  import { useScopedRegle } from './scoped-config';

  const { r$ } = useScopedRegle({ firstName: '' }, { firstName: { required } });
</script>

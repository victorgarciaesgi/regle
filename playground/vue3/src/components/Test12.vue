<script setup lang="ts">
import { useRegle, type RegleStatus } from '@regle/core';
import { required } from '@regle/rules';
import { onMounted, ref } from 'vue';

const { r$ } = useRegle({ nested: { name: '' } }, { nested: { name: { required: required } } });

const foo: RegleStatus<Record<string, any> | undefined> = r$.$fields.nested;
</script>

<template>
  <span></span>
  <!-- <pre>{{ r$.$fields.email }}</pre>

  <label>Name</label><br />
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button> -->
</template>

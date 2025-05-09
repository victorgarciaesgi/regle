<script setup lang="ts">
import { useRegle } from '@regle/core';
import { onMounted, ref } from 'vue';

const data = ref<{ email?: string }>({});

const { r$ } = useRegle(data, {}, { autoDirty: false });

onMounted(() => {
  setTimeout(() => {
    r$.$value = { email: 'foo' };
  }, 1000);
});

async function submit() {
  const result = await r$.$validate();
  data.value = result.data;
}
</script>

<template>
  <pre>{{ r$.$fields.email }}</pre>

  <label>Name</label><br />
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
</template>

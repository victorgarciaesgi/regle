<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    <input type="text" v-model="data.name" />
    <br />
    invalid: {{ r$.$invalid }}
    <br />
    <br />
    <button @click="assign">assign new value</button>
    <br />
    <br />
    <br />
    {{ r$.$errors }}
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRegle } from '@regle/core';
import { maxLength, minLength, required } from '@regle/rules';

const data = ref<{ name: string }>({
  name: '',
});

const { r$ } = useRegle(data, {
  name: {
    required,
  },
});

const assign = () => {
  data.value = {
    name: '',
  };
};
</script>

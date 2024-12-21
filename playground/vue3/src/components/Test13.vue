<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    <input type="text" v-model="data.name" />
    <br />
    dirty:
    {{ r$.$anyDirty }} {{ r$.$fields.name.$dirty }}
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
import { useRegle } from '@regle/core';
import { minLength, required } from '@regle/rules';
import { ref } from 'vue';

const data = ref<{ name: string }>({
  name: '',
});

const { r$ } = useRegle(data, {
  name: {
    required,
    minLength: minLength(3),
  },
});

const assign = () => {
  r$.$silentValue = {
    name: 'e',
  };
};
</script>

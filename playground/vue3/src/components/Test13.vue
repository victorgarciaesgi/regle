<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    <input type="text" v-model="data.name" />
    <br />
    invalid: {{ r$.$invalid }} {{ r$.$fields.name.$invalid }}
    valid:
    {{ r$.$valid }} {{ r$.$fields.name.$valid }}
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
    minLength: minLength(3),
  },
});

const assign = () => {
  data.value = {
    name: 'e',
  };
};
</script>

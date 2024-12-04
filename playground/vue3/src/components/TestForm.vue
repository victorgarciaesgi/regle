<template>
  <main>
    <button @click="() => r$.$validate()">validate</button>
    <br />
    <br />
    data: {{ data }}
    <br />
    invalid: {{ r$.$invalid }}
    <br />
    <br />
    <button @click="add">add level</button>
    <button @click="remove">remove level</button>
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

const data = ref<{
  name: string;
  levels: { name: string; localizations: { name: string }[] }[];
}>({
  name: 'a',
  levels: [],
});

const { r$ } = useRegle(data, {
  name: { required },
  levels: {
    minLength: minLength(1),
    maxLength: maxLength(3),
    $each: {
      name: { required },
      localizations: {
        $each: {
          name: { required },
        },
      },
    },
  },
});

const add = () => {
  data.value.levels.push({ name: 'a', localizations: [{ name: 'a' }] });
};

const remove = () => {
  data.value.levels.pop();
};
</script>

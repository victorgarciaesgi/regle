<template>
  <main>
    <br />
    <br />
    <input type="text" v-model="data.test" />
    <ul>
      <li v-for="error of r$.$errors.test" :key="error">{{ error }}</li>
    </ul>

    <button @click="() => r$.$validate()">validate</button>

    <pre>
      {{ r$ }}
    </pre>
  </main>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { and, applyIf, checked, minLength, required, oneOf, nativeEnum } from '@regle/rules';
import { ref } from 'vue';

const data = ref({
  test: '',
});

enum Food {
  Meat = 'Meat',
  Fish = 'Fish',
}

const { r$ } = useRegle(data, {
  test: {
    // oneOf: oneOf(['One', 'Two']),
    enum: nativeEnum(Food),
  },
});

r$.$reset();
</script>

<template>
  <div class="devtools-harness">
    <h1>Collection devtools harness</h1>

    <label>
      Item name
      <input v-if="r$.items.$each[0]" v-model="r$.items.$each[0].name.$value" data-testid="collection-item-name" />
    </label>

    <p data-testid="collection-item-invalid">{{ r$.items.$each[0]?.name.$invalid }}</p>
    <p data-testid="collection-self-invalid">{{ r$.items.$self.$invalid }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { minLength, required } from '@regle/rules';
  import { ref } from 'vue';

  const form = ref({
    items: [{ name: '' }],
  });

  const { r$ } = useRegle(
    form,
    {
      items: {
        minLength: minLength(2),
        $each: {
          name: { required },
        },
      },
    },
    { id: 'playwright-devtools-collection' }
  );
</script>

<style scoped>
  .devtools-harness {
    display: grid;
    gap: 1rem;
    max-width: 40rem;
    margin: 2rem auto;
    padding: 1rem;
  }
</style>

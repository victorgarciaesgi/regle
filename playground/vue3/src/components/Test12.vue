<script setup lang="ts">
  import { ref } from 'vue';
  import FormLoader from './FormLoader.vue';

  const isOpen = ref(false);
  const result = ref('');

  function open() {
    result.value = 'Waiting for $validate()...';
    isOpen.value = true;
  }

  function onResult(value: string) {
    result.value = value;
    isOpen.value = false;
  }
</script>

<template>
  <div class="container p-3">
    <h2>$validate() while the component unmounts</h2>

    <button v-if="!isOpen" class="btn btn-primary" @click="open"> Open form </button>
    <FormLoader v-else :on-result="onResult" />

    <pre class="mt-3">{{ result }}</pre>
  </div>
</template>

<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

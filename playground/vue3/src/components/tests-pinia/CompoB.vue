<template>
  <div class="demo-container">
    <div>
      <input v-model="testForm.r$.$value.name" placeholder="Name:" />
      <button type="button" @click="testForm.r$.$reset({ toInitialState: true })"> Reset </button>
      <button type="button" @click="testForm.r$.$silentValue = { name: 'bite' }"> Set value </button>
    </div>
    <ul v-if="testForm.r$.$errors.name.length">
      <li v-for="error of testForm.r$.$errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
  <JSONViewer :data="testForm.r$"></JSONViewer>
</template>

<script setup lang="ts">
import { useTestStore } from '@/stores/test.store';
import JSONViewer from '../JSONViewer.vue';

const testForm = useTestStore();
// testForm.r$.$reset();
</script>

<style lang="scss" scoped></style>

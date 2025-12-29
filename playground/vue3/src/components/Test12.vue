<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useRegle } from '@regle/core';
import { required, minLength, email, withMessage } from '@regle/rules';

const state = ref({ files: [] as File[] });

const { r$ } = useRegle(state, {
  files: {
    required,
    $each: {
      required,
      otherValidation: withMessage((value) => {
        if (value instanceof File) {
          return value.size > 1000000000;
        }
        return false;
      }, 'File is too light'),
    },
  },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  // if (valid) {
  //   console.log(data.name)
  //   //               ^ string
  //   console.log(data.email)
  //   //.              ^ string | undefined
  // } else {
  //   console.warn('Errors: ', r$.$errors)
  // }
}

async function handleFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    r$.files.$value = Array.from(files);
    await nextTick();
    r$.files.$touch();
  }
}
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">Files</label>
      <input
        class="form-control"
        :model-value="r$.files.$value"
        placeholder="Select files"
        :class="{
          'is-valid': r$.files.$correct,
          'is-invalid': r$.files.$error,
        }"
        aria-describedby="name-error"
        type="file"
        multiple
        @change="handleFileChange"
      />
      <div v-for="file of r$.files.$each" :key="file.$id">
        {{ file.$value?.name }}
      </div>
    </div>

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

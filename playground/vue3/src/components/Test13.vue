<template>
  <main>
    invalid: {{ r$.$invalid }}
    <br />
    <br />
    <input type="text" v-model="data.firstName" />
    <br />
    <br />
    <button @click="touch">touch</button>
    <button @click="validate">validate</button>
    <br />
    <br />
    {{ validForm }}{{ validateResult }}
    <br />
    <br />
    Error: {{ error }}
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRegle, type RegleResult } from '@regle/core';
import { maxLength, minLength, required } from '@regle/rules';

const validForm = ref('');
const error = ref('');
const validateResult = ref<object>();

const data = ref<{
  firstName?: string;
  groups?: number[];
}>({
  firstName: 'John',
  groups: [1, 2, 3, 4, 5, 6], // when remove groups then works
});

const { r$ } = useRegle(data, {
  firstName: { required },
  groups: { required },
});

const clear = () => {
  error.value = '';
  validForm.value = '';
  validateResult.value = undefined;
};

const touch = () => {
  clear();

  try {
    r$.$touch();
    validForm.value = r$.$invalid ? 'invalid' : 'valid';
  } catch (e: any) {
    error.value = e;
    throw e;
  }
};

const validate = async () => {
  clear();

  try {
    validateResult.value = await r$.$validate();
  } catch (e: any) {
    error.value = e;
    throw e;
  }
};
</script>

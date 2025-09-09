<script setup lang="ts">
import { z } from 'zod';
import { inferSchema, useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';

type Form = {
  testArray: string[];
};

const schema = z.object({
  testArray: z.array(z.string()).min(1),
});

const form = ref<Form>({
  testArray: [],
});

const regleSchema = inferSchema(form, schema);
const { r$ } = useRegleSchema(form, regleSchema);

let i = 0;
function addItem() {
  form.value.testArray.push('' + ++i);
}

async function handleSubmit() {
  const { valid, data } = await r$.$validate();

  const { $errors } = r$;
  console.log({ valid });

  if (form.value.testArray.length) {
    console.log('expected $errors.testArray.self to be empty or not exist(?)');
  } else {
    console.log('expected $errors.testArray.self to be present');
  }

  console.log('actual $errors value', $errors);
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div style="border: 1px solid">
      <div>Items</div>
      <div v-for="item in form.testArray" :key="item">item - #{{ item }}</div>
    </div>
    <button type="button" @click="addItem">addItem</button>

    {{ r$.testArray.$errors }}

    <div>---------</div>
    <button type="submit">Submit</button>
  </form>
</template>

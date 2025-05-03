<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';
import { ref } from 'vue';

const data = ref({});
const valid = ref(false);

const { r$ } = useRegleSchema(
  { name: '', emptystring: null },
  z.object({
    name: z.string().min(1),
    emptystring: z.string().catch('empty'),
  }),
  { syncState: { onUpdate: true }, autoDirty: false }
);

async function submit() {
  const result = await r$.$validate();
  data.value = result.data;
  valid.value = result.valid;
}
</script>

<template>
  <div>Valid: {{ valid }}</div>

  <pre>{{ data }}</pre>
  <pre>{{ r$.$value }}</pre>

  <label>Name</label><br />
  <input v-model="r$.$value.name" placeholder="Type your name" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.name" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
</template>

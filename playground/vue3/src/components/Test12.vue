<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 500px">
    <input v-model="r$.$value.email" />
    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
    <button @click="submit">Submit me!</button>
    <button @click="setValues">Set</button>
  </div>

  <pre>{{ r$.$errors }}</pre>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v4';

const form = ref({
  email: '',
  user: {
    firstName: '',
    lastName: '',
  },
  contacts: [{ name: '' }],
});

const schema = z.object({
  email: z.email(),
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  }),
  contacts: z.array(
    z.object({
      name: z.string().min(1),
    })
  ),
});

function setValues() {
  r$.email.$value = 'test@email.com';
  r$.user.firstName.$value = 'John';
  r$.user.lastName.$value = 'Doe';
  if (form.value.contacts[0]) {
    form.value.contacts[0].name = 'Contact';
  }
}

const { r$ } = useRegleSchema(form, schema, { rewardEarly: true });

const submit = async () => {
  const res = await r$.$validate();
  console.log(res);
};
</script>

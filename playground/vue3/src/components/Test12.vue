<script setup lang="ts">
import { reactive } from 'vue';
import { useRegleSchema } from '@regle/schemas';
import * as z from 'zod';

const ContactPersonSchema = z.object({
  name: z.string().min(1, 'Name Required'),
  email: z.email('Error in email'),
  phone: z
    .string()
    .min(1, 'Required')
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{3,}$/, 'Not Valid'),
});

const Schema = z.object({
  contactPersons: z.array(ContactPersonSchema),
});

type Dto = z.infer<typeof Schema>;

const state = reactive<Dto>({
  contactPersons: [
    {
      name: '',
      email: '',
      phone: '',
    },
  ],
});
const { r$ } = useRegleSchema(state, Schema);

const addContact = () => {
  state.contactPersons.push({
    name: '',
    email: '',
    phone: '',
  });
};
</script>

<template>
  <h2>Hello Regle!</h2>
  <div>
    <label>Errors in the model:</label>
    <span>{{ r$.contactPersons.$each?.[0].$errors }}</span>
  </div>
  <div v-for="(contact, index) in state.contactPersons" :key="index">
    <div>
      <label>Person</label>
      <input v-model="contact.name" />
    </div>
    <div>
      <label>Email</label>
      <input v-model="contact.email" />
    </div>
    <div>
      <label>Phone</label>
      <input v-model="contact.phone" />
    </div>
  </div>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

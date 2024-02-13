<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />

    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>

    <input :value="form.firstName" @input="updateFirstName" placeholder="firstname" />
    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <!-- <input type="date" v-model="form.birthDate" placeholder="Birth date" /> -->
    <!-- <ul>
      <li v-for="error of errors.birthDate" :key="error">{{ error }}</li>
    </ul> -->

    <!-- <input type="date" v-model="form.today" placeholder="Today" /> -->
    <!-- <ul>
      <li v-for="error of errors.today" :key="error">{{ error }}</li>
    </ul> -->

    <template :key="index" v-for="(input, index) of form.nested">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <!-- TODO types for collections errors -->
        <li v-for="error of errors.nested.$each[index].name" :key="error">{{ error }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.nested.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.nested.splice(0, 1)">Remove first</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { useZodForm } from '@regle/zod';
import { nextTick, reactive } from 'vue';
import { z } from 'zod';

type Form = {
  email: string;
  firstName?: number;
  nested: [{ name: string }];
};

const form = reactive<Form>({
  email: '',
  firstName: 0,
  nested: [{ name: '' }],
});

async function updateFirstName(event: any) {
  const t0 = performance.now();
  form.firstName = event.target.value;
  await nextTick();
  const t1 = performance.now();
  console.log(`Time it takes to run the function: ${t1 - t0} ms`);
}

async function submit() {
  const t0 = performance.now();
  // const result = await validateForm();
  const t1 = performance.now();
  console.log(`Time it takes to run the function: ${t1 - t0} ms`);

  // if (result) {
  //   const test: string = result.foo.bloublou.test[0].name;
  // }
}

const { errors, regle, validateForm } = useZodForm(
  form,
  z.object({
    email: z
      .string({ required_error: 'foobar' })
      .min(1)
      .email({ message: 'This must be an email' })
      .refine((val) => val === 'foo@free.fr', 'Bite'),
    firstName: z.coerce
      .number({ invalid_type_error: 'Not a number', required_error: 'Bite' })
      .optional(),
    nested: z.array(
      z.object({
        name: z.string().min(1, 'Required'),
      })
    ),
  })
);
</script>

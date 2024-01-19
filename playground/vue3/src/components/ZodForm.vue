<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />

    <ul>
      <li v-for="error of $errors.email" :key="error">{{ error }}</li>
    </ul>

    <input :value="form.firstName" @input="updateFirstName" placeholder="firstname" />
    <ul>
      <li v-for="error of $errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <!-- <input type="date" v-model="form.birthDate" placeholder="Birth date" /> -->
    <!-- <ul>
      <li v-for="error of $errors.birthDate" :key="error">{{ error }}</li>
    </ul> -->

    <!-- <input type="date" v-model="form.today" placeholder="Today" /> -->
    <!-- <ul>
      <li v-for="error of $errors.today" :key="error">{{ error }}</li>
    </ul> -->

    <!-- <template :key="index" v-for="(input, index) of form.foo?.bloublou.test">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of $errors.foo.bloublou.test.$each[index].name" :key="error">{{
          error
        }}</li>
      </ul>
    </template> -->

    <!-- <button type="submit" @click="form.foo?.bloublou.test.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.foo?.bloublou.test.splice(0, 1)">Remove first</button> -->
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ $regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { useZodForm } from '@regle/zod';
import { nextTick, reactive, ref } from 'vue';
import { z } from 'zod';

type Form = {
  email?: string;
  firstName?: string;
  nested: {
    foo: string;
  };
};

const form = reactive<Form>({
  email: '',
  firstName: '',
  nested: {
    foo: '',
  },
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

const schema = z.object({
  email: z
    .string()
    .min(1, { message: 'This is required' })
    .email({ message: 'This must be an email' }),
  firstName: z.string().min(1),
  nested: z.object({
    foo: z.string().min(1),
  }),
});

console.log(z.string());

const { $errors, $regle } = useZodForm(
  form,
  z.object({
    email: z
      .string()
      .min(1, { message: 'This is required' })
      .email({ message: 'This must be an email' })
      .refine((val) => val === 'foo')
      .optional(),
    firstName: z.string().min(1, 'Min length of 1'),
    nested: z.object({
      foo: z.string().min(1),
    }),
  })
);
</script>

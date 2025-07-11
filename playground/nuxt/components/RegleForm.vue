<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />
    <span v-if="r$.email?.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of r$.$errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      v-model="form.firstName"
      :placeholder="`firstName ${r$.$fields?.firstName?.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.birthDate" type="date" placeholder="Birth date" />
    <ul>
      <li v-for="error of r$.$errors.birthDate" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.today" type="date" placeholder="Today" />
    <ul>
      <li v-for="error of r$.$errors.today" :key="error">{{ error }}</li>
    </ul>

    <h2>Collection validation</h2>

    <template v-for="(input, index) of form.foo.bloublou.test" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of r$.$errors.foo.bloublou.test.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.foo.bloublou.test.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.foo.bloublou.test.splice(0, 1)"> Remove first </button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import type { RegleExternalErrorTree } from '@regle/core';
import { and, dateAfter, maxLength, not, required, sameAs, withMessage } from '@regle/rules';
import { reactive, ref } from 'vue';
import { asyncEmail, useRegle } from './validations';

type Form = {
  email?: string;
  firstName?: string;
  birthDate?: Date;
  today?: Date;
  foo: {
    bar?: number | undefined;
    bloublou: {
      test: {
        name: string;
      }[];
    };
  };
};

const form = reactive<Form>({
  email: '',
  foo: {
    bar: 5,
    bloublou: {
      test: [{ name: 'foo' }],
    },
  },
});

async function submit() {
  const { valid, data } = await r$.$validate();

  if (valid) {
    const test: string = data.foo.bloublou.test[0].name;
  }
}

const limit = ref(2);

const externalErrors = ref<RegleExternalErrorTree<Form>>({});

const { r$ } = useRegle(
  form,
  () => ({
    email: {
      required,
      foo: withMessage(
        and(asyncEmail(2), maxLength(6)),
        ({ $params: [limit, max], foo }) => `Should be ${limit}, AND maxLength: ${max}. Metadata: ${foo}`
      ),
      $debounce: 300,
    },
    firstName: {
      ...(limit.value === 2 && { required }),
      not: not(
        sameAs(() => form.email),
        ({ $params: [target] }) => `Should not be same as email (${target})`
      ),
    },
    birthDate: {
      required,
    },
    today: {
      dateAfter: dateAfter(() => form.birthDate),
    },
    foo: {
      bloublou: {
        test: {
          $each: {
            name: { required },
          },
        },
      },
    },
  }),
  { externalErrors }
);
</script>

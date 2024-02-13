<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input :value="form.email" @input="updateEmail" placeholder="email" />
    <span v-if="regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      :value="form.firstName"
      @input="updateFirstName"
      :placeholder="`firstName ${regle.$fields.firstName.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.birthDate" placeholder="Birth date" />
    <ul>
      <li v-for="error of errors.birthDate" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.today" placeholder="Today" />
    <ul>
      <li v-for="error of errors.today" :key="error">{{ error }}</li>
    </ul>

    <template :key="index" v-for="(input, index) of form.foo.bloublou.test">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of errors.foo.bloublou.test.$each[index].name" :key="error">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.foo.bloublou.test.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.foo.bloublou.test.splice(0, 1)">Remove first</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ errors }}
{{ regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { RegleExternalErrorTree } from '@regle/core';
import { and, dateAfter, maxLength, not, required, sameAs, withMessage } from '@regle/validators';
import { nextTick, reactive, ref } from 'vue';
import { asyncEmail, useRegle } from './../validations';
import { minLength } from '@regle/validators';

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

async function updateFirstName(event: any) {
  const t0 = performance.now();
  form.firstName = event.target.value;
  await nextTick();
  const t1 = performance.now();
  console.log(`Time it takes to update firstname: ${t1 - t0} ms`);
}

async function updateEmail(event: any) {
  const t0 = performance.now();
  form.email = event.target.value;
  await nextTick();
  const t1 = performance.now();
  console.log(`Time it takes to update email: ${t1 - t0} ms`);
}
async function submit() {
  const t0 = performance.now();
  const result = await validateForm();
  if (externalEven.value % 2 === 0) {
    externalErrors.value.email = ['boo'];
  }
  const t1 = performance.now();
  console.log(`Time it takes to run the function: ${t1 - t0} ms`);

  if (result) {
    const test: string = result.foo.bloublou.test[0].name;
  }
  externalEven.value++;
}

const limit = ref(2);
const externalEven = ref(0);

const externalErrors = ref<RegleExternalErrorTree<Form>>({});

const { regle, errors, validateForm } = useRegle(
  form,
  () => ({
    email: {
      required,
      foo: withMessage(and(asyncEmail(2), maxLength(6)), (_, { $params: [limit, max], foo }) => [
        `Should be ${limit}, AND maxLength: ${max}. Metadata: ${foo}`,
        'bite',
      ]),
      $debounce: 300,
    },
    firstName: {
      ...(limit.value === 2 && { required }),
      not: not(
        sameAs(() => form.email),
        (_, { $params: [target] }) => `Should not be same as email (${target})`
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
            name: { required, minLength: minLength(2), $rewardEarly: true },
          },
        },
      },
    },
  }),
  { $externalErrors: externalErrors }
);
</script>

<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />
    <span v-if="$regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of $errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      v-model="form.firstName"
      :placeholder="`firstName ${$regle.$fields.firstName.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of $errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <template :key="index" v-for="(input, index) of form.foo.bloublou.test">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of $errors.foo.bloublou.test.$each[index].name" :key="error">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.foo.bloublou.test.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.foo.bloublou.test.splice(0, 1)">Remove first</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ $errors }}
{{ $regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import {
  applyIf,
  maxLength,
  required,
  withMessage,
  decimal,
  email,
  and,
  minLength,
  not,
  sameAs,
} from '@regle/validators';
import { reactive, ref, watch } from 'vue';
import { asyncEmail, useRegle } from './../validations';
import { or } from '@regle/validators';
import { RegleExternalErrorTree } from '@regle/core';

type Form = {
  email?: string;
  firstName?: number;
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
  firstName: undefined,
  foo: {
    bar: 5,
    bloublou: {
      test: [{ name: 'foo' }],
    },
  },
});

async function submit() {
  const result = await validateForm();
  errors.value.email = ['boo'];
  if (result) {
    const test: string = result.foo.bloublou.test[0].name;
  }
}

const limit = ref(2);

const errors = ref<RegleExternalErrorTree<Form>>({});

const { $regle, $errors, validateForm, $state } = useRegle(
  form,
  () => ({
    email: {
      required,
      foo: withMessage(
        and(email, minLength(6)),
        (_, min) => `Should be email OR minlength: ${min}`
      ),
    },
    firstName: {
      ...(limit.value === 2 && { required }),
      not: not(
        sameAs(() => form.email),
        'Should not be same as email'
      ),
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
  { $externalErrors: errors }
);
</script>

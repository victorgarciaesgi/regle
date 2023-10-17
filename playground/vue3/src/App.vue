<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />
    <span v-if="$regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      v-model="form.firstName"
      :placeholder="`firstName ${$regle.$fields.firstName.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
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
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ errors }}
{{ $regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { maxLength, required, withMessage, applyIf } from '@regle/validators';
import { ref } from 'vue';
import { useRegle, asyncEmail, not } from './validations';
import { requiredIf } from '@regle/validators';

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

const form = ref<Form>({
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
  if (result) {
    const test: string = result.foo.bloublou.test[0].name;
  }
}

const limit = ref(2);

const { $regle, errors, validateForm, state } = useRegle(form, () => ({
  email: {
    maxLength: withMessage(
      maxLength(() => limit.value),
      (value, count) => `Max length is ${count}`
    ),
    asyncEmail: applyIf(
      () => limit.value === 3,
      withMessage(asyncEmail(limit), 'Limit should be 2')
    ),
    required,
  },
  firstName: {
    ...(limit.value === 2 && { required }),
    not: not(form.value.email),
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
}));
</script>

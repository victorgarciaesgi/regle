<template>
  <div style="display: flex; flex-flow: column wrap; width: 400px">
    <input v-model="form.email" placeholder="email" />
    <span v-if="$regle.$fields.email.$pending" style="color: red">Loading</span>
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>
    <input v-model.number="limit" placeholder="limit" />

    <input v-model="form.firstName" placeholder="firstName" />

    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>
    <input v-model="form.foo.bloublou.test[0].name" placeholder="name" />
    <ul>
      <li v-for="error of errors.foo.bloublou.test.$each[0].name" :key="error">{{ error }}</li>
    </ul>
    <pre>
      <code>
{{ errors }}
{{ $regle }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { maxLength, required, requiredIf } from '@regle/core';
import { ref } from 'vue';
import { useRegle, asyncEmail, timeout } from './validations';
import { withAsync, withMessage } from '@regle/core/src/helpers';

type Form = {
  email: string;
  firstName?: Date;
  foo: {
    bar: number | undefined;
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

const limit = ref(2);

const { $regle, errors } = useRegle(form, () => ({
  email: {
    maxLength: withMessage(
      maxLength(() => limit.value),
      (value, count) => `Euuuh non ${count}`
    ),
    asyncEmail: withMessage(asyncEmail(limit), 'Prout'),
  },
  firstName: {
    required: withMessage(
      requiredIf(() => limit.value === 2),
      'Requis!'
    ),
  },
  foo: {
    bloublou: {
      test: {
        required,
        $each: {
          name: { required },
        },
      },
    },
  },
}));
</script>

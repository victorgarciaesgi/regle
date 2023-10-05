<template>
  <div style="display: flex; flex-flow: column wrap; width: 400px">
    <input v-model="form.email" placeholder="email" />
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>
    <input v-model.number="limit" placeholder="limit" />

    <input v-model="form.firstName" placeholder="firstName" />

    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>
    <input v-model="form.foo.bloublou.test[0].name" placeholder="name" />
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
import { useRegle } from './validations';
import { withMessage } from '@regle/core/src/helpers';

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
    required: withMessage((value: any) => {
      if (limit.value === 2) {
        return value != '' && value != null;
      }
      return true;
    }, 'Hihi'),
    maxLength: maxLength(() => limit.value),
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

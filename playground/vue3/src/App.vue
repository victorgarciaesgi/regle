<template>
  <div style="display: flex; flex-flow: column wrap; width: 400px">
    <input v-model="form.email" placeholder="email" />
    <!-- <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul> -->
    <input v-model.number="limit" placeholder="limit" />

    <input v-model="form.firstName" placeholder="firstName" />

    <input v-model="form.foo.bar" placeholder="foobar" />
    <!-- <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul> -->
    <pre>
      <code>
{{ $shibie }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { maxLength, required, requiredIf } from '@shibie/core';
import { ref } from 'vue';
import { useForm } from './validations';
import { withMessage } from '@shibie/core/src/helpers';

type Form = {
  email: string;
  firstName?: Date;
  foo: {
    bar: number | undefined;
    bloublou: {
      test: string[];
    };
  };
};

const form = ref<Form>({
  email: '',
  firstName: undefined,
  foo: {
    bar: 5,
    bloublou: {
      test: [],
    },
  },
});

const limit = ref(2);

const { $shibie } = useForm(form, () => ({
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
    bar: {
      required,
    },
    bloublou: {
      test: {},
    },
  },
}));
</script>

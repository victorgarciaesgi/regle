<template>
  <form>
    <h1>Sign up</h1>
    <MyInput
      v-model="form.user.firstName"
      :field="r$.$fields.user.$fields.firstName"
      placeholder="Type your first name"
      label="First name"
    />
    <MyInput
      v-model="form.user.lastName"
      :field="r$.$fields.user.$fields.lastName"
      placeholder="Type your last name"
      label="Last name"
    />
    <MyInput
      v-model="form.user.pseudo"
      :field="r$.$fields.user.$fields.pseudo"
      placeholder="Type your pseudo"
      label="Pseudo"
    />
    <MyTextArea
      v-model="form.description"
      :field="r$.$fields.user.$fields.pseudo"
      placeholder="Type your pseudo"
      label="Pseudo"
    />
  </form>
</template>

<script setup lang="ts">
import { maxLength, minLength, required, withMessage } from '@regle/rules';
import { reactive } from 'vue';
import { checkPseudo, useCustomRegle } from './components/regle.global.config';
import MyInput from './components/MyInput.vue';
import MyTextArea from './components/MyTextArea.vue';

type Form = {
  user: {
    firstName?: string;
    lastName?: string;
    pseudo?: string;
  };
  email?: string;
  description?: string;
  acceptTC?: boolean;
  projects: Array<{ name: string; url: string; price: number }>;
  password?: string;
  confirmPassword?: string;
};

const form = reactive<Form>({
  user: {
    firstName: undefined,
    lastName: undefined,
    pseudo: undefined,
  },
  email: undefined,
  acceptTC: undefined,
  projects: [],
  description: undefined,
  password: undefined,
  confirmPassword: undefined,
});

const { r$ } = useCustomRegle(form, {
  user: {
    firstName: {
      required,
      minLength: minLength(4),
      maxLength: maxLength(30),
    },
    lastName: {
      required,
      minLength: minLength(4),
      maxLength: maxLength(30),
    },
    pseudo: {
      required,
      checkPseudo,
    },
  },
  description: {
    minLength: withMessage(
      minLength(100),
      (_, { $params: [min] }) => `Your description must be at least ${min} characters long`
    ),
  },
});
</script>

<style lang="scss">
body {
  display: flex;
  justify-content: center;
  padding-top: 200px;
}

h1 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 10px;
}
form {
  width: 400px;
  box-shadow: 0 0 20px rgb(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-flow: column nowrap;
  gap: 20px;
}
</style>

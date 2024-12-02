<template>
  <form @submit.prevent="submit">
    <h1>Sign up</h1>
    <div class="fields">
      <template v-if="r$.$fields.user.$fields">
        <MyInput
          v-model="r$.$fields.user.$fields.name.$value"
          :field="r$.$fields.user.$fields.name"
          placeholder="Type your name"
          label="Name"
        />
        <MyInput
          v-model="r$.$fields.user.$fields.email.$value"
          :field="r$.$fields.user.$fields.email"
          placeholder="Type your email"
          label="Email"
        />
        <MyInput
          v-model="r$.$fields.user.$fields.pseudo.$value"
          :field="r$.$fields.user.$fields.pseudo"
          placeholder="Type your pseudo"
          label="Pseudo"
        />
      </template>
      <MyTextArea
        v-model="form.description"
        :field="r$.$fields.description"
        placeholder="Type your description"
        label="Description"
      />
      <MyCheckBox
        v-model="form.acceptTC"
        :field="r$.$fields.acceptTC"
        placeholder="Accept our terms and conditions"
      />
      <label>Your projects</label>
      <div class="projects">
        <div
          v-for="(project, index) of r$.$fields.projects.$each"
          :key="project.$id"
          class="project"
        >
          <MyInput
            v-model="project.$fields.name.$value"
            :field="project.$fields.name"
            placeholder="Name of the project"
            label="Name"
          />
          <MyInput
            v-model.number="project.$fields.price.$value"
            :field="project.$fields.price"
            placeholder="Price of the project"
            label="Price"
          />
          <MyInput
            v-model="project.$fields.github_url.$value"
            :field="project.$fields.github_url"
            placeholder="Url of the project"
            label="Url"
          />
          <span class="delete" @click="form.projects.splice(index, 1)">❌</span>
        </div>
        <div class="add">
          <button type="button" @click="form.projects.push({})">⊕ Add project</button>
        </div>
      </div>
      <ul v-if="r$.$errors.projects.$errors.length">
        <li v-for="error of r$.$errors.projects.$errors" :key="error">
          {{ error }}
        </li>
      </ul>

      <Password
        v-model="form.password"
        :field="r$.$fields.password"
        placeholder="Type your password"
        label="Password"
      />
      <MyInput
        v-model="form.confirmPassword"
        type="password"
        :field="r$.$fields.confirmPassword"
        placeholder="Confirm your password"
        label="Confirm your password"
      />
    </div>
    <div class="button-list">
      <button type="button" @click="r$.$resetAll">Reset</button>
      <button type="submit">Submit</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {
  checked,
  contains,
  email,
  maxLength,
  maxValue,
  minLength,
  minValue,
  numeric,
  required,
  requiredIf,
  sameAs,
  url,
  withMessage,
} from '@regle/rules';
import { reactive, ref } from 'vue';
import MyCheckBox from './components/MyCheckBox.vue';
import MyInput from './components/MyInput.vue';
import MyTextArea from './components/MyTextArea.vue';
import Password from './components/Password.vue';
import { checkPseudo, strongPassword, useCustomRegle } from './components/regle.global.config';
import type { RegleExternalErrorTree } from '@regle/core';

type Form = {
  user?: {
    name?: string;
    email?: string;
    pseudo?: string;
  };
  description?: string;
  acceptTC?: boolean;
  projects: Array<{ name?: string; github_url?: string; price?: number }>;
  password?: string;
  confirmPassword?: string;
};

const form = reactive<Form>({
  projects: [{ name: 'foo', github_url: 'fezf' }],
});

const externalErrors = ref<RegleExternalErrorTree<Form>>({
  acceptTC: ['Server error'],
  confirmPassword: ['Server error'],
  password: ['Server error'],
  projects: {
    $each: [{ name: ['Server error'] }],
  },
  user: {
    name: ['Server error'],
    email: ['Server error'],
  },
});

function dirtyFields() {
  console.log(r$.$extractDirtyFields(false));
}

const { r$ } = useCustomRegle(
  form,
  {
    user: {
      name: {
        required,
        minLength: minLength(4),
        maxLength: maxLength(30),
      },
      email: {
        required,
        email,
      },
      pseudo: {
        required: requiredIf(() => !!form.acceptTC),
        checkPseudo,
      },
    },
    description: {
      minLength: withMessage(
        minLength(100),
        (_, { $params: [min] }) => `Your description must be at least ${min} characters long`
      ),
    },
    projects: {
      $autoDirty: false,
      // minLength: withMessage(
      //   minLength(4),
      //   (value, { $params: [min] }) => `You need at least ${min} projects`
      // ),
      $each: {
        name: { required },
        price: { required, numeric, minValue: minValue(1), maxValue: maxValue(1000) },
        github_url: { url, contains: contains('github') },
      },
    },
    acceptTC: { required, checked, $autoDirty: false },
    password: { required, strongPassword: strongPassword() },
    confirmPassword: {
      required,
      sameAs: sameAs(() => form.password, 'password'),
    },
  },
  {
    externalErrors: externalErrors,
  }
);

async function submit() {
  await r$.$validate();
  // if (result) {
  //   result.acceptTC;

  //   // Check autocompletion for type safe output
  // }
}
</script>

<style lang="scss"></style>

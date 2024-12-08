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
          data-testid="name"
        />
        <MyInput
          v-model="r$.$fields.user.$fields.email.$value"
          :field="r$.$fields.user.$fields.email"
          placeholder="Type your email"
          label="Email"
          data-testid="email"
        />
        <MyInput
          v-model="r$.$fields.user.$fields.pseudo.$value"
          :field="r$.$fields.user.$fields.pseudo"
          placeholder="Type your pseudo"
          label="Pseudo"
          data-testid="pseudo"
        />
      </template>
      <MyTextArea
        v-model="form.description"
        :field="r$.$fields.description"
        placeholder="Type your description"
        label="Description"
        data-testid="description"
      />

      <label>Your projects</label>
      <div class="projects">
        <div
          v-for="(project, index) of r$.$fields.projects.$each"
          :key="project.$id"
          class="project"
        >
          <h3>Project {{ index + 1 }}</h3>
          <MyInput
            v-model="project.$fields.name.$value"
            :field="project.$fields.name"
            placeholder="Name of the project"
            label="Name"
            :data-testid="`project-${index}-name`"
          />
          <MyInput
            v-model.number="project.$fields.price.$value"
            :field="project.$fields.price"
            placeholder="Price of the project"
            label="Price"
            :data-testid="`project-${index}-price`"
          />
          <MyInput
            v-model="project.$fields.github_url.$value"
            :field="project.$fields.github_url"
            placeholder="Url of the project"
            label="Url"
            :data-testid="`project-${index}-url`"
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
        data-testid="password"
      />
      <MyInput
        v-model="form.confirmPassword"
        type="password"
        :field="r$.$fields.confirmPassword"
        placeholder="Confirm your password"
        label="Confirm your password"
        data-testid="confirmPassword"
      />

      <MyCheckBox
        v-model="form.acceptTC"
        :field="r$.$fields.acceptTC"
        placeholder="Accept our terms and conditions"
        data-testid="acceptTC"
      />
    </div>
    <div class="button-list">
      <button data-testid="reset" type="button" @click="r$.$resetAll">Reset</button>
      <button data-testid="submit" type="submit">Submit</button>
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

type Form = {
  user: {
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
  user: {},
  projects: [{ name: '', github_url: '' }],
});

const { r$ } = useCustomRegle(form, {
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
    minLength: withMessage(
      minLength(1),
      (value, { $params: [min] }) => `You need at least ${min} project`
    ),
    $each: {
      name: { required },
      price: { required, numeric, minValue: minValue(1), maxValue: maxValue(1000) },
      github_url: { url, contains: contains('github') },
    },
  },
  acceptTC: {
    required: withMessage(required, 'You need to accept T&C'),
    checked: withMessage(checked, 'You need to accept T&C'),
  },
  password: { required, strongPassword: strongPassword() },
  confirmPassword: {
    required,
    sameAs: sameAs(() => form.password, 'password'),
  },
});

async function submit() {
  const { result, data } = await r$.$validate();

  if (result) {
    alert('Form is valid!');
  }
}
</script>

<style lang="scss"></style>

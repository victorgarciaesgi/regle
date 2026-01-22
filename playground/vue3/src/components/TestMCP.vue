<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required, email, minLength, sameAs, withMessage } from '@regle/rules';
  import { ref } from 'vue';

  type SignupForm = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  const state = ref<SignupForm>({});

  const { r$ } = useRegle(state, {
    name: {
      required: withMessage(required, 'Name is required'),
      minLength: withMessage(minLength(2), 'Name must be at least 2 characters'),
    },
    email: {
      required: withMessage(required, 'Email is required'),
      email: withMessage(email, 'Please enter a valid email address'),
    },
    password: {
      required: withMessage(required, 'Password is required'),
      minLength: withMessage(minLength(8), 'Password must be at least 8 characters'),
    },
    confirmPassword: {
      required: withMessage(required, 'Please confirm your password'),
      sameAs: withMessage(
        sameAs(() => state.value.password),
        'Passwords must match'
      ),
    },
  });

  async function handleSubmit() {
    const { valid, data } = await r$.$validate();

    if (!valid) {
      console.log('Form has errors');
      return;
    }

    console.log('Submitting:', data);
    r$.$reset();
  }
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Name</label>
      <input v-model="r$.$value.name" placeholder="Enter your name" />
      <ul v-if="r$.name.$errors.length">
        <li v-for="error of r$.name.$errors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div>
      <label>Email</label>
      <input v-model="r$.$value.email" type="email" placeholder="Enter your email" />
      <ul v-if="r$.email.$errors.length">
        <li v-for="error of r$.email.$errors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div>
      <label>Password</label>
      <input v-model="r$.$value.password" type="password" placeholder="Enter password" />
      <ul v-if="r$.password.$errors.length">
        <li v-for="error of r$.password.$errors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div>
      <label>Confirm Password</label>
      <input v-model="r$.$value.confirmPassword" type="password" placeholder="Confirm password" />
      <ul v-if="r$.confirmPassword.$errors.length">
        <li v-for="error of r$.confirmPassword.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <button type="submit" :disabled="!r$.$correct">Sign Up</button>
  </form>
</template>

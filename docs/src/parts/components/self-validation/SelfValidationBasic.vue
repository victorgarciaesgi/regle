<template>
  <div class="demo-container">
    <div style="display: flex; flex-direction: column; gap: 1rem">
      <div class="">
        <input
          v-model="r$.user.firstName.$value"
          :class="{ valid: r$.user.firstName.$correct, error: r$.user.firstName.$error }"
          placeholder="First name"
        />
        <ul v-if="r$.$errors.user?.firstName?.length">
          <li v-for="error of r$.$errors.user.firstName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
      <div>
        <input
          v-model="r$.user.lastName.$value"
          :class="{ valid: r$.user.lastName.$correct, error: r$.user.lastName.$error }"
          placeholder="Last name"
        />
        <ul v-if="r$.$errors.user?.lastName?.length">
          <li v-for="error of r$.$errors.user.lastName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <ul v-if="r$.$errors.user?.$self?.length">
      <li v-for="error of r$.$errors.user.$self" :key="error">
        {{ error }}
      </li>
    </ul>

    <div class="button-list">
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Maybe } from '@regle/core';
  import { useRegle } from '@regle/core';
  import { minLength } from '@regle/rules';
  import { isFilled, required, withMessage } from '@regle/rules';
  import { ref } from 'vue';

  type User = {
    firstName: string;
    lastName: string;
  };

  const state = ref<{ user: User }>({
    user: {
      firstName: '',
      lastName: '',
    },
  });

  const { r$ } = useRegle(state, {
    user: {
      $self: {
        atLeastOneName: withMessage(
          (value: Maybe<User>) => isFilled(value?.firstName) || isFilled(value?.lastName),
          'At least one name is required'
        ),
      },
      firstName: { minLength: minLength(3) },
      lastName: { minLength: minLength(3) },
    },
  });
</script>

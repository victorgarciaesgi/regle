<script setup lang="ts">
  import { ref, type MaybeRef, type Ref } from 'vue';
  import { useRegle, type JoinDiscriminatedUnions } from '@regle/core';
  import { required, minLength, email, literal, and } from '@regle/rules';

  type State = {
    name: string;
    address?: {
      street?: string;
      city?: string;
    };
  };

  const foo = and(required, minLength(2));

  const state = ref<State>({ name: '', address: {} });

  const { r$ } = useRegle(state, {
    name: { foo: and(required, minLength(2)) },
    address: {
      $self: {
        required,
      },
    },
  });

  const { valid, data } = await r$.$validate();

  if (valid) {
    // TODO address should not be undefined
    console.log(data.name);
  }

  r$.address.$self;
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>
    <div class="py-2 has-validation">
      <label class="form-label">Email (optional)</label>
      {{ r$.$errors }}
      <ul id="email-errors">
        <li v-for="error of r$.address.$self.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

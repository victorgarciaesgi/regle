<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input
          v-model="form.email"
          :class="{ valid: r$.email.$correct, error: r$.email.$error }"
          placeholder="Type your email"
        />

        <ul v-if="r$.$errors.email.length">
          <li v-for="error of r$.$errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <input
          v-model="form.name.pseudo"
          :class="{
            valid: r$.name.$correct,
            error: r$.name.pseudo.$error,
          }"
          placeholder="Type your pseudo"
        />

        <ul v-if="r$.$errors.name.pseudo.length">
          <li v-for="error of r$.$errors.name.pseudo" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div class="button-list">
      <button type="button" @click="r$.$clearExternalErrors">Reset external Errors</button>
      <button type="button" @click="() => r$.$reset({ toInitialState: true, clearExternalErrors: true })"
        >Reset All</button
      >
      <button class="primary" type="button" @click="submit">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { required } from '@regle/rules';
  import { ref } from 'vue';
  import { type RegleExternalErrorTree, useRegle } from '@regle/core';

  const form = ref({
    email: '',
    name: {
      pseudo: '',
    },
  });

  const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

  const { r$ } = useRegle(
    form,
    {
      email: { required },
      name: { pseudo: { required } },
    },
    {
      externalErrors,
    }
  );

  async function submit() {
    const { valid } = await r$.$validate();

    if (valid) {
      externalErrors.value = {
        email: ['Email already exists'],
        name: {
          pseudo: ['Pseudo already exists'],
        },
      };
    }
  }
</script>

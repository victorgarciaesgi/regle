<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>Require name validation (required + min length 4)</label>
    </div>

    <div class="row">
      <div class="field">
        <input
          v-model="form.name"
          :class="{ valid: r$.name.$correct, error: r$.name.$error }"
          placeholder="Type your name"
        />
        <ul v-if="r$.$errors.name.length">
          <li v-for="error of r$.$errors.name" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div class="field">
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
    </div>

    <div class="button-list">
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { required, email, minLength, assignIf } from '@regle/rules';
  import { ref } from 'vue';

  const condition = ref(false);

  const form = ref({ name: '', email: '' });

  const { r$ } = useRegle(form, {
    name: assignIf(condition, { required, minLength: minLength(4) }),
    email: { email },
  });
</script>

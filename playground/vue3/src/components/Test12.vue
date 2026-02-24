<script setup lang="ts">
  import { ref } from 'vue';
  import { defineRegleConfig } from '@regle/core';
  import { pipe, requiredIf, minLength } from '@regle/rules';

  const { useRegle } = defineRegleConfig({
    shortcuts: {
      fields: {
        $isRequired: (field) => {
          return Boolean(field.$rules.required?.$active) || Boolean(field.$rules.requiredIf?.$active) || false;
        },
      },
    },
  });

  const state = ref({ firstName: '', lastName: '', checked: false });

  const foo = pipe(
    requiredIf(() => state.value.checked),
    minLength(4)
  );

  const { r$ } = useRegle(state, () => {
    return {
      firstName: { required: requiredIf(() => state.value.checked), minLength: minLength(4) },
      lastName: pipe(
        requiredIf(() => state.value.checked),
        minLength(4)
      ), // requiredIf allways true
    };
  });

  async function submit() {
    const { valid, data } = await r$.$validate();
    if (valid) {
      console.log(data.firstName);
    } else {
      console.warn('Errors: ', r$.$errors);
    }
  }
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">First Name</label>
      <input
        class="form-control"
        v-model="r$.$value.firstName"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.firstName.$correct,
          'is-invalid': r$.firstName.$error,
        }"
        aria-describedby="name-error"
      />
      <span v-if="r$.firstName.$isRequired" style="color: red"
        >This is a required shortcut in the object declaration.</span
      >

      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.firstName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="py-2 has-validation">
      <label class="form-label">Last Name</label>
      <input
        class="form-control"
        v-model="r$.$value.lastName"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.lastName.$correct,
          'is-invalid': r$.lastName.$error,
        }"
        aria-describedby="name-error"
      />
      <span v-if="r$.lastName.$isRequired" style="color: red"
        >This is a required shortcut in the pipe declaration.</span
      >

      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.lastName" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="checked" v-model="state.checked" />
      <label class="form-check-label" for="checked"> Set required </label>
    </div>

    <button class="btn btn-primary m-2" @click="submit">Submit</button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

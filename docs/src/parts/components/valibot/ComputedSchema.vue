<template>
  <div class="demo-container">
    <div class="row">
      <div class="input-container">
        <input
          v-model="form.firstName"
          :class="{ valid: r$.firstName.$correct, error: r$.firstName.$error }"
          placeholder="Type your first name"
        />

        <ul v-if="r$.$errors.firstName.length">
          <li v-for="error of r$.$errors.firstName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div class="input-container">
        <input
          v-model="form.lastName"
          :class="{ valid: r$.lastName.$correct, error: r$.lastName.$error }"
          placeholder="Type your last name"
        />

        <ul v-if="r$.$errors.lastName.length">
          <li v-for="error of r$.$errors.lastName" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegleSchema, withDeps } from '@regle/schemas';
import * as v from 'valibot';
import { ref, computed } from 'vue';

const form = ref({ firstName: '', lastName: '' });

const schema = computed(() =>
  v.object({
    firstName: v.string(),
    lastName: withDeps(
      v.pipe(
        v.string(),
        v.check((v) => v !== form.value.firstName, "Last name can't be equal to first name")
      ),
      [() => form.value.firstName]
    ),
  })
);

const { r$ } = useRegleSchema(form, schema);
</script>

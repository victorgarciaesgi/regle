<script setup lang="ts">
import { createVariant, defineRules, narrowVariant, refineRules, useRegle, type InferInput } from '@regle/core';
import { email, literal, minLength, minValue, numeric, required, sameAs, type } from '@regle/rules';
import { computed, ref } from 'vue';

const defaultRules = defineRules({
  firstName: { required },
  password: { required, type: type<string>() },
  type: { required, type: type<'ONE' | 'TWO'>() },
});

const rules = refineRules(defaultRules, (state) => {
  const variant = createVariant(state, 'type', [
    { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
    { type: { literal: literal('ONE') }, oneValue: { numeric, required, minValue: minValue(4) } },
  ]);

  console.log(state);

  return {
    confirmPassword: { required, type: type<string>(), sameAs: sameAs(() => state.value.password) },
    ...variant.value,
  };
});

const state = ref<InferInput<typeof rules>>({});

const { r$ } = useRegle(state, rules);
</script>

<template>
  <h2>Hello Regle</h2>

  <label>Name</label><br />
  <input v-model="r$.$value.password" placeholder="Type your password" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>

  <label>Email (optional)</label><br />
  <input v-model="r$.$value.confirmPassword" placeholder="Type your confirmPassword" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.confirmPassword" :key="error">
      {{ error }}
    </li>
  </ul>

  <!-- <button @click="submit">Submit</button> -->
  <button @click="r$.$reset()">Reset</button>
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

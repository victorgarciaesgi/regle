<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import {
  useRegle,
  type InferInput,
  type RegleUnknownRulesTree,
  type ReglePartialRuleTree,
  type RegleRuleDefinition,
  createVariant,
  refine,
  narrowVariant,
} from '@regle/core';
import { required, minLength, email, numeric, type, literal, minValue, sameAs } from '@regle/rules';

const rules = refine(
  {
    firstName: { required },
    oneValue: { type: type<number>() },
    twoValue: { type: type<number>() },
  },
  (state) => {
    const variant = createVariant(state as unknown as Ref<{ type: any }>, 'type', [
      { type: { literal: literal('TWO') }, twoValue: { numeric, required } },
      { type: { literal: literal('ONE') }, oneValue: { numeric, required, minValue: minValue(4) } },
      { type: { required } },
    ]);
    return {
      ...variant.value,
    };
  }
);

const state2 = ref<InferInput<typeof rules>>();

const { r$: r$2 } = useRegle(state2, rules);

type foo = keyof typeof r$2.$fields;

if (narrowVariant(r$2.$fields, 'type', 'ONE')) {
}

const rules2 = computed(() => {
  return {
    password: { required },
    confirmPassword: { required, sameAs: sameAs(() => state3.value.password) },
  };
});
const state3 = ref<InferInput<typeof rules2>>({ password: '', confirmPassword: '' });

const state = ref({ email: '', name: '' });

const { r$ } = useRegle(state, {
  name: { required, minLength: minLength(4) },
  email: { email },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    console.log(data.name);
    //               ^ string
    console.log(data.email);
    //.              ^ string | undefined
  } else {
    console.warn('Errors: ', r$.$errors);
  }
}
</script>

<template>
  <h2>Hello Regle</h2>

  <label>Name</label><br />
  <input v-model="r$.$value.name" placeholder="Type your name" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.name" :key="error">
      {{ error }}
    </li>
  </ul>

  <label>Email (optional)</label><br />
  <input v-model="r$.$value.email" placeholder="Type your email" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
  <button @click="r$.$reset()">Reset</button>
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>

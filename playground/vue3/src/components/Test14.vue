<template>
  <div class="demo-container">
    <div class="block">
      <input v-model="condition" type="checkbox" />
      <label>The field is required</label>
    </div>
    <div>
      <input
        v-model="form.foo"
        type="date"
        :class="{ valid: r$.foo.$correct, error: r$.foo.$error }"
        :placeholder="`Type your foo${r$.foo.$rules.required.$active ? '*' : ''}`"
      />
      <button type="button" @click="r$.$reset({ toInitialState: true })">
        Reset
      </button>
    </div>
    <ul v-if="r$.$errors.foo.length">
      <li v-for="error of r$.$errors.foo" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
  <JSONViewer :data="r$"></JSONViewer>
</template>

<script setup lang="ts">
import { inferRules, useRegle } from '@regle/core'
import { applyIf, minLength, required } from '@regle/rules'
import { ref } from 'vue'
import JSONViewer from './JSONViewer.vue'

type Form = {
  foo: Date
}

const form = ref<Form>({ foo: new Date() })
const condition = ref(false)

const { r$ } = useRegle(form, {
  foo: {
    required,
  },
})
</script>

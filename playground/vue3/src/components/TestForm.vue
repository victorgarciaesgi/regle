<template>
  <div class="demo-container">
    <!-- <input v-model.number="form.level0Async.value" placeholder="level 0" />
    <input v-model.number="form.level1.level2.childAsync.value" placeholder="Level 1" /> -->
    <div class="button-list">
      <button type="button" @click="validate">Submit</button>
    </div>
    <pre>{{ regle }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { Maybe } from '@regle/core';
import { createRule, useRegle } from '@regle/core';
import { ref } from 'vue';
import { email, minLength, required, requiredIf, ruleHelpers } from '@regle/rules';
import { timeout } from '@/validations';

type Form = {
  firstName?: string;
  lastName?: string;
};

const form = ref<Form>({ firstName: '', lastName: '' });

const { errors, regle, validateState } = useRegle(form, {
  lastName: { required: minLength(6) },
});

async function submit() {
  const result = await validateState();
  if (result) {
    console.log(result);
  }
}
</script>

<style lang="scss"></style>

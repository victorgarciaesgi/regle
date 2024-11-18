<template>
  <div class="demo-container">
    <input v-model.number="form.level0Async.value" placeholder="level 0" />
    <input v-model.number="form.level1.level2.childAsync.value" placeholder="Level 1" />
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
import { minLength, required, requiredIf, ruleHelpers } from '@regle/rules';
import { timeout } from '@/validations';

function ruleMockIsEvenAsync() {
  return createRule({
    async validator(value: Maybe<number>) {
      if (ruleHelpers.isFilled(value)) {
        await timeout(1000);
        return value % 2 === 0;
      }
      return true;
    },
    message: 'Custom error',
  });
}

function ruleMockIsFooAsync() {
  return createRule({
    async validator(value: Maybe<string>) {
      if (ruleHelpers.isFilled(value)) {
        await timeout(1000);
        console.log(value === 'foo');
        return value === 'foo';
      }
      return true;
    },
    message: 'Custom error',
  });
}

const ruleMockIsEven = createRule({
  validator(value: Maybe<number>) {
    if (ruleHelpers.isFilled(value)) {
      return value % 2 === 0;
    }
    return true;
  },
  message: 'Custom error',
});

const form = {
  level0Async: ref(1),
  level1: {
    child: ref(2),
    level2: {
      childAsync: ref(''),
    },
  },
};

async function validate() {
  const result = await validateState();
  console.log(result);
}

const { regle, validateState } = useRegle(form, () => ({
  level0Async: { ruleEvenAsync: ruleMockIsEvenAsync() },
  level1: {
    child: { ruleEven: ruleMockIsEven },
    level2: {
      childAsync: { ruleAsync: ruleMockIsFooAsync() },
    },
  },
}));
</script>

<style lang="scss"></style>

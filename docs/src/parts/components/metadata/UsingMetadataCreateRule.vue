<template>
  <div class="demo-container">
    <div>
      <input
        v-model="state.password"
        :class="{ valid: regle.$fields.password.$valid }"
        placeholder="Type your password"
      />
      <button type="button" @click="resetAll">Reset</button>
    </div>
    <div
      class="password-strength"
      :class="[`level-${regle.$fields.password.$rules.strongPassword.$metadata.result?.id}`]"
    ></div>
    <ul v-if="errors.password.length">
      <li v-for="error of errors.password" :key="error">
        {{ error }}
      </li>
    </ul>
    <div v-else-if="regle.$fields.password.$valid" class="success"
      >Your password is strong enough</div
    >
  </div>
</template>

<script setup lang="ts">
import { createRule, useRegle, type Maybe } from '@regle/core';
import { ruleHelpers } from '@regle/rules';
import { passwordStrength, type Options } from 'check-password-strength';

const strongPassword = createRule({
  validator: (value: Maybe<string>, options?: Options<string>) => {
    if (ruleHelpers.isFilled(value)) {
      const result = passwordStrength(value, options);
      return {
        $valid: result.id > 1,
        result,
      };
    }
    return { $valid: true };
  },
  message(value, { result }) {
    return `Your password is ${result?.value.toLocaleLowerCase()}`;
  },
});

const { state, regle, errors, resetAll } = useRegle(
  { password: '' },
  {
    password: {
      strongPassword: strongPassword(),
    },
  }
);
</script>

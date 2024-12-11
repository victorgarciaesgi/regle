<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.password"
        :class="{ valid: r$.$fields.password.$valid }"
        placeholder="Type your password"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
    </div>
    <div
      class="password-strength"
      :class="[`level-${r$.$fields.password.$rules.strongPassword.$metadata.result?.id}`]"
    ></div>
    <ul v-if="r$.$errors.password.length">
      <li v-for="error of r$.$errors.password" :key="error">
        {{ error }}
      </li>
    </ul>
    <div v-else-if="r$.$fields.password.$valid" class="success">Your password is strong enough</div>
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
  message({ result }) {
    return `Your password is ${result?.value.toLocaleLowerCase()}`;
  },
});

const { r$ } = useRegle(
  { password: '' },
  {
    password: {
      strongPassword: strongPassword(),
    },
  }
);
</script>

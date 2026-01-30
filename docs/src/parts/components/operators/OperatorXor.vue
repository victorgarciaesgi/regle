<template>
  <div class="demo-container">
    <div>
      <input
        v-model="r$.$value.code"
        :class="{ valid: r$.code.$correct, error: r$.code.$error }"
        placeholder="Type A or B (but not both)"
      />

      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>

    <ul v-if="r$.$errors.code.length">
      <li v-for="error of r$.$errors.code" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { xor, contains, withMessage } from '@regle/rules';

  const { r$ } = useRegle(
    { code: '' },
    {
      code: {
        myError: withMessage(
          xor(contains('A'), contains('B')),
          ({ $params: [charA, charB] }) => `Field should contain either "${charA}" or "${charB}", but not both`
        ),
      },
    }
  );
</script>

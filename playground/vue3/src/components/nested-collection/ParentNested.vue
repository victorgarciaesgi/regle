<template>
  <div>
    <div>
      <Compo3 />
      <Compo1 />
      <Compo2 />
    </div>
    <Compo2 />
    <Compo1 />

    Collected from scoped components:
    <div>
      <pre>
        <code>{{ r$ }}</code>
      </pre>
    </div>

    <div>
      <button @click="r$.$validate">Validate scoped components</button>
      <button @click="r$.$reset">Reset scoped components</button>
    </div>
    <hr />
    <label>Local Input (not using scoped): </label>
    <input v-model="independantR$.$value.local" placeholder="Local" />
    <ul>
      <li v-for="error of independantR$.$errors.local" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import Compo1 from './Compo1.vue';
import Compo2 from './Compo2.vue';
import Compo3 from './Compo3.vue';
import { useCollectScopedValidations } from './config';
import { minLength } from '@regle/rules';

const { r$ } = useCollectScopedValidations();

const { r$: independantR$ } = useRegle(
  { local: '' },
  {
    local: { minLength: minLength(4) },
  }
);
</script>

<style lang="scss" scoped></style>

<template>
  <div>
    <div>
      <Compo3 />
      <Compo1 />
      <Compo2 />
    </div>
    <Compo2 />
    <Compo1 />

    Collected from nested component:
    <div>
      <pre>
        <code>{{ r$ }}</code>
      </pre>
    </div>

    <div>
      <button @click="r$.$validate">Validate nested component</button>
    </div>

    <label>Local Input (not using nested): </label>
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
import { useCollectNestedValidations } from './config';
import { minLength } from '@regle/rules';

const { r$ } = useCollectNestedValidations();

const { r$: independantR$ } = useRegle(
  { local: '' },
  {
    local: { minLength: minLength(4) },
  }
);
</script>

<style lang="scss" scoped></style>

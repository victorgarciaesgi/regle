<template>
  <div>
    <div v-if="show">
      <Compo1 />
      <Compo2 />
    </div>
    <Compo3 />
    <Compo2 />
    <Compo1 />

    <div>
      <button @click="r$.$validate">Validate scoped components</button>
      <button @click="r$.$reset">Reset scoped components</button>
      <button @click="show = !show">Toggle show</button>
    </div>

    Collected from scoped components:
    <div>
      <pre>
        <code>{{ r$.$errors }}</code>
      </pre>
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
import { useCollectScope } from './config';
import { minLength } from '@regle/rules';
import { ref } from 'vue';

const { r$ } = useCollectScope('foo');

const show = ref(false);

const { r$: independantR$ } = useRegle(
  { local: '' },
  {
    local: { minLength: minLength(4) },
  }
);
</script>

<style lang="scss" scoped></style>

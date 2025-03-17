<template>
  <main>
    <input v-model="foo" placeholder="test" />
    <ul v-if="r$Field.$errors">
      <li v-for="error of r$Field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>

    <button type="button" @click="r$Merged.$reset({ toInitialState: true })">Reset</button>

    <JSONViewer :data="r$" />
  </main>
</template>

<script setup lang="ts">
import { mergeRegles, useRegle } from '@regle/core';
import { applyIf, numeric, regex, required, withMessage } from '@regle/rules';
import { ref } from 'vue';
import JSONViewer from './JSONViewer.vue';

function handleEvent(event: Event) {
  // console.log(event.target.files[0]);
  // r$Merged.$value.r$.competency = event.target.files[0];
}

const data = ref({
  competency: 0,
  level: { id: 1 },
});

const data2 = ref({
  name: '',
  level: { count: 1 },
});

const foo = ref('bar');

const { r$: r$Field } = useRegle(foo, { required });

const { r$ } = useRegle(data, {
  competency: { number: applyIf(() => true, withMessage(regex(/\d/), 'Your password must have one number')) },
  level: {
    id: { required },
  },
});

const { r$: otherR$ } = useRegle(data2, {
  name: { required },
  level: {
    count: { numeric },
  },
});

const r$Merged = mergeRegles({ r$, otherR$ });

async function submit() {
  const { valid, data } = await r$Merged.$validate();
}
</script>

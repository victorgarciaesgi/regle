<template>
  <div>
    <Child1 v-if="showChild1" />
  </div>
  <br />
  <Child2 v-if="showChild2" />

  <br />
  <div class="demo-container">
    <div class="button-list">
      <button @click="showChild1 = !showChild1">Toggle firstname</button>
      <button @click="showChild2 = !showChild2">Toggle email</button>
      <button @click="reset">Reset</button>
      <button class="primary" @click="r$.$validate">Submit</button>
    </div>
  </div>
  <br />
  <div
    >Valid: <b>{{ r$.$correct }}</b>
  </div>
  Collected errors:
  <pre class="json">{{ r$.$errors }}</pre>
  <br />
  Collected values:
  <pre class="json">{{ r$.$value }}</pre>
</template>

<script setup lang="ts">
import { useCollectScope } from './scoped-config';
import Child1 from './Child1.vue';
import Child2 from './Child2.vue';
import { ref } from 'vue';

const showChild1 = ref(true);
const showChild2 = ref(true);

function reset() {
  showChild1.value = true;
  showChild2.value = true;
  r$.$resetAll();
}

const { r$ } = useCollectScope();
</script>

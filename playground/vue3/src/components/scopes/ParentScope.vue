<script setup lang="ts">
import { useCollectScope } from './scope-config';
import Child1 from './Child1.vue';
import Child2 from './Child2.vue';
import JSONViewer from '../JSONViewer.vue';

const { r$ } = useCollectScope(['contacts', 'persons']);
</script>

<template>
  <div>
    <Child1 />
    <Child2 />
  </div>
  <JSONViewer :data="r$" />
</template>

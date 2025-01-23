<template>
  <div v-if="showScope1">
    <Scope1 key="1" />
    <Scope1 key="2" />
  </div>
  <div v-if="showScope2">
    <Scope2 key="1" />
    <Scope2 key="2" />
    <Scope2 key="3" />
  </div>
  <div v-if="showScope3">
    <Scope3CustomConfig />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useScope1Validations, useScope2Validations, useScope3Validations } from './config';
import Scope1 from './Scope1.vue';
import Scope2 from './Scope2.vue';
import Scope3CustomConfig from './Scope3CustomConfig.vue';

const showScope1 = ref(false);
const showScope2 = ref(false);
const showScope3 = ref(false);

const { r$: scope1R$ } = useScope1Validations();
const { r$: scope2R$ } = useScope2Validations();
const { r$: scope3R$ } = useScope3Validations();

defineExpose({ showScope1, showScope2, showScope3, scope1R$, scope2R$, scope3R$ });
</script>

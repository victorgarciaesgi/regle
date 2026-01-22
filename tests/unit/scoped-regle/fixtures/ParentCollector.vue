<template>
  <Scope0 />
  <div v-if="showScope1">
    <Scope1 v-if="showScope1_1" key="1" />
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
  <div v-if="showScope1Namespace">
    <Scope4WithNamespace :scope="scopeNamespace" />
    <Scope4WithNamespace scope="scope2" />
  </div>

  <div v-if="showScope5">
    <Scope5asRecord />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    useScope1Validations,
    useScope2Validations,
    useScope3Validations,
    useScope5Validations,
  } from './scoped-config';
  import Scope0 from './Scope0.vue';
  import Scope1 from './Scope1.vue';
  import Scope2 from './Scope2.vue';
  import Scope3CustomConfig from './Scope3CustomConfig.vue';
  import Scope4WithNamespace from './Scope4WithNamespace.vue';
  import { useCollectScope } from '@regle/core';
  import Scope5asRecord from './Scope5asRecord.vue';

  const showScope1 = ref(false);
  const showScope1_1 = ref(true);

  const showScope2 = ref(false);
  const showScope3 = ref(false);

  const showScope5 = ref(false);

  const showScope1Namespace = ref(false);
  const scopeNamespace = ref('scope');

  const { r$: scope0R$ } = useCollectScope();
  const { r$: scope1R$ } = useScope1Validations();
  const { r$: scope1NamespaceR$ } = useScope1Validations('scope');
  const { r$: scope2R$ } = useScope2Validations();
  const { r$: scope3R$ } = useScope3Validations();

  const { r$: scope5R$ } = useScope5Validations<{ scope5: { scope5Record: string } }>();

  const { r$: scope6NamespaceR$ } = useScope1Validations(['scope', 'scope2']);

  defineExpose({
    showScope1,
    showScope1_1,
    showScope1Namespace,
    showScope2,
    showScope3,
    showScope5,
    scope0R$,
    scope1R$,
    scope2R$,
    scope3R$,
    scope1NamespaceR$,
    scopeNamespace,
    scope5R$,
    scope6NamespaceR$,
  });
</script>

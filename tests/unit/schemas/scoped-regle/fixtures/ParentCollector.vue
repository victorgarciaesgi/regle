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

  <div v-if="showScope1Namespace">
    <Scope4WithNamespace :scope="scopeNamespace" />
  </div>

  <div v-if="showScope5">
    <Scope5asRecord :scope="scopeNamespace" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useScope1Validations, useScope2Validations, useScope5Validations } from './scoped-config';
  import Scope0 from './Scope0.vue';
  import Scope1 from './Scope1.vue';
  import Scope2 from './Scope2.vue';
  import Scope4WithNamespace from './Scope4WithNamespace.vue';
  import { useCollectSchemaScope } from '@regle/schemas';
  import Scope5asRecord from './Scope5asRecord.vue';

  const showScope1 = ref(false);
  const showScope1_1 = ref(true);

  const showScope2 = ref(false);

  const showScope5 = ref(false);

  const showScope1Namespace = ref(false);
  const scopeNamespace = ref('scope');

  const { r$: scope0R$ } = useCollectSchemaScope();
  const { r$: scope1R$ } = useScope1Validations();
  const { r$: scope1NamespaceR$ } = useScope1Validations('scope');
  const { r$: scope2R$ } = useScope2Validations();

  const { r$: scope5R$ } = useScope5Validations<{ scope5: { scope5Record: string } }>();

  defineExpose({
    showScope1,
    showScope1_1,
    showScope1Namespace,
    showScope2,
    scope0R$,
    scope1R$,
    scope2R$,
    scope1NamespaceR$,
    scopeNamespace,
    showScope5,
    scope5R$,
  });
</script>

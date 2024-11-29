<template>
  <pre>{{ r$ }}</pre>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import type { RegleExternalErrorTree, RegleFieldStatus, RegleStatus } from '@regle/core';
import { ref } from 'vue';

interface Form {
  referenceNumber: { name: { foo: '' } };
  shipmentItems: {
    name: string;
  }[];
}

const form = ref<Form>({
  referenceNumber: { name: { foo: '' } },
  shipmentItems: [{ name: '' }, { name: '' }],
});

const externalErrors = ref<RegleExternalErrorTree<Form>>({});

const { r$ } = useRegle(
  form,
  {
    referenceNumber: {
      name: {
        foo: { required: () => true },
      },
    },
  },
  { externalErrors }
);

r$.$fields.referenceNumber satisfies RegleStatus<any, any>;
</script>

<style lang="scss" scoped></style>

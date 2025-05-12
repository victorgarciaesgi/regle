<template>
  <ComponentTest
    :unknown-field="r$.$fields.firstName"
    :unknown-explicit-field="r$.$fields.checked"
    :boolean-field="r$.$fields.checked"
    :string-field="r$.$fields.firstName"
    :string-number-field="r$.$fields.num"
    :custom-string-field="r$2.$fields.firstName"
    :enforced-rules-field="r$.$fields.firstName"
    :enforced-multiple-rules-field="r$.$fields.firstName"
    :enforced-custom-rules-field="r$2.$fields.firstName"
  />
  <!-- @vue-expect-error wrong props -->
  <ComponentTest v-bind="fakeProps" :unknown-field="r$.$fields" />

  <!-- @vue-expect-error wrong props -->
  <ComponentTest v-bind="fakeProps" :boolean-field="r$.$fields.firstName" />

  <!-- @vue-expect-error wrong props -->
  <ComponentTest v-bind="fakeProps" :enforced-rules-field="r$.$fields.lastName" />

  <!-- @vue-expect-error wrong props -->
  <ComponentTest v-bind="fakeProps" :enforced-custom-rules-field="r$2.$fields.lastName" />
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import ComponentTest from './Component-test.vue';
import { checked, minLength, required, sameAs } from '@regle/rules';
import { useCustomRegle } from './prop-types.config';
import type { ComponentProps } from 'vue-component-type-helpers';

type Props = ComponentProps<typeof ComponentTest>;

const fakeProps = {} as Props;

const { r$ } = useRegle(
  {
    checked: false,
    firstName: '',
    lastName: '',
    num: 0,
  },
  {
    checked: { checked: checked },
    firstName: { required: required, sameAs: sameAs('foo'), minLength: minLength(4) },
  }
);

const { r$: r$2 } = useCustomRegle(
  {
    checked: false,
    firstName: '',
    lastName: '',
    num: 0,
  },
  {
    checked: { checked: checked },
    firstName: { required, myCustomRule: () => true },
  }
);
</script>

<style lang="scss" scoped></style>

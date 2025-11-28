<script setup lang="ts">
import * as v from 'valibot';
import { useRegleSchema } from '@regle/schemas';
import { type NarrowVariant, narrowVariant } from '@regle/core';

const schema = v.object({
  a: v.variant('type', [
    v.object({
      type: v.literal('foo'),
    }),
    v.object({
      type: v.literal('bar'),
    }),
  ]),
});

const { r$ } = useRegleSchema({ a: { type: 'foo' } }, schema);

type Root = typeof r$;
type Narrow = NarrowVariant<Root['a'], 'type', 'foo'>;

if (narrowVariant(r$.a, 'type', 'foo')) {
  r$.a.$value.type;
}

type IsNarrowTypeValueFoo = Narrow['type']['$value'] extends 'foo' ? true : false; // true, ok
type IsNarrowValueTypeFoo = Narrow['$value']['type'] extends 'foo' ? true : false; // true, ok
type IsNarrowTypeValueBar = Narrow['type']['$value'] extends 'bar' ? true : false; // false, ok
type IsNarrowValueTypeBar = Narrow['$value']['type'] extends 'bar' ? true : false; // false, ok

const value: Narrow['$value'] = { type: 'foo' };
// @ts-expect-error
const value2: Narrow['$value'] = { type: 'bar' };
/*
const value: {
    type: "foo" | "bar";
}
*/
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

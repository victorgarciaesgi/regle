<script setup lang="ts">
import { narrowVariant } from '@regle/core'
import { useRegleSchema } from '@regle/schemas'
import * as v from 'valibot'
import { ref } from 'vue'

const variantSchema = v.object({
  items: v.array(
    v.variant('type', [
      v.object({
        type: v.literal('text'),
        text: v.pipe(v.string(), v.nonEmpty()),
      }),
      v.object({
        type: v.literal('image'),
        url: v.string(),
      }),
    ]),
  ),
})

const state = ref<{ items: { type: 'text'; text: string }[] }>({
  items: [{ type: 'text', text: 'foo' }],
})
const { r$ } = useRegleSchema(state, variantSchema)

const first = r$.items.$each[0]

if (narrowVariant(first, 'type', 'text')) {
  first.text.$anyDirty
}
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

<script setup lang="ts">
import type { JoinDiscriminatedUnions } from '@regle/core';
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const schema = z.object({
  gender: z.enum(['M', 'F']).nullable(),
});

type test = JoinDiscriminatedUnions<{
  gender: 'M' | 'F' | null;
}>;

const { r$ } = useRegleSchema(
  {
    gender: null,
  },
  z.object({
    gender: z.enum(['M', 'F']).nullable(),
  })
);
</script>

<template>
  <h2>Hello Regle!</h2>

  <code class="status">{{ r$.$value }}</code>
</template>

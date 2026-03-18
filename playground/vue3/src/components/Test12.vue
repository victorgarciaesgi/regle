<script setup lang="ts">
  import { createVariant, narrowVariant, useRegle } from '@regle/core';
  import { literal, minLength, number, required, string } from '@regle/rules';
  import { ref } from 'vue';
  import { type UnionToTuple, type IsUnion } from 'type-fest';

  interface TierFixed {
    type: 'fixed';
    messages: string[];
    audienceUUIDs: string[];
    rewards: string[];
  }

  interface TierTiered {
    type: 'tiered';
    messages: string[];
    audienceUUIDs: string[];
    tieredRewards: {
      stepID: string;
      triggerValue: string;
      rewards: string[];
    };
  }

  type Tier = TierFixed | TierTiered;

  interface FormState {
    name: string;
    tiers: Tier[];
  }

  const state = ref<FormState>({ name: '', tiers: [] });

  const { r$ } = useRegle(state, {
    name: { required, minLength: minLength(4) },
    tiers: {
      minLength: minLength(1),
      required,
      $each: (item) => {
        const tierTypeVariant = createVariant(() => item.value, 'type', [
          {
            type: { literal: literal('fixed') },
            messages: { $each: {}, minLength: minLength(1) },
            audienceUUIDs: { $each: { string }, minLength: minLength(1) },
            rewards: { $each: {}, minLength: minLength(1), required },
          },
          {
            type: { literal: literal('tiered') },
            messages: { $each: {}, minLength: minLength(1) },
            audienceUUIDs: { $each: { string }, minLength: minLength(1) },
            tieredRewards: {
              stepID: { required, number },
              triggerValue: { required, string },
              rewards: { $each: {}, minLength: minLength(1) },
            },
          },
        ]);
        return tierTypeVariant.value;
      },
    },
  });

  type foo =
    | {
        type: 'fixed';
        messages: string[];
        audienceUUIDs: string[];
        rewards: string[];
      }
    | {
        type: 'tiered';
        messages: string[];
        audienceUUIDs: string[];
        tieredRewards: {
          stepID: string;
          triggerValue: string;
          rewards: string[];
        };
      }[][number];
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    <div class="py-2 has-validation">
      <label class="form-label">Name</label>
      <input
        v-model="r$.$value.name"
        class="form-control"
        placeholder="Type your name"
        :class="{
          'is-valid': r$.name.$correct,
          'is-invalid': r$.name.$error,
        }"
        aria-describedby="name-error"
      />
      <ul id="name-errors" class="invalid-feedback">
        <li v-for="error of r$.$errors.name" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>

    <div v-for="tier in r$.tiers.$each" :key="tier.$id">
      {{ tier. }}
      <div v-if="narrowVariant(tier, 'type', 'fixed')">
        {{ tier.rewards }}
        <!-- how to narrow here -->
      </div>

      <div v-if="narrowVariant(tier, 'type', 'tiered')">
        {{ tier.tieredRewards.$value }}
      </div>
    </div>

    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

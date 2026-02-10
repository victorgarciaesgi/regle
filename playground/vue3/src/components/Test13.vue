<script setup lang="ts">
  import { createVariant, narrowVariant, useRegle } from '@regle/core';
  import { literal, number, required, string } from '@regle/rules';
  import { ref } from 'vue';

  interface RewardAmountTypeFixed {
    type: 'fixed';
    amount: number;
  }

  interface RewardAmountTypeDynamic {
    type: 'dynamic';
    stepID: number;
    percentage: number;
  }

  interface CampaignConfigStepsReward {
    rewardAmount?: RewardAmountTypeFixed | RewardAmountTypeDynamic;
    rewardMetadata: {
      type: 'A' | 'B';
    };
  }

  const state = ref<CampaignConfigStepsReward>({
    rewardAmount: {
      type: 'fixed',
      amount: 1,
    },
    rewardMetadata: {
      type: 'A',
    },
  });

  const { r$ } = useRegle(state, () => {
    if (state.value.rewardMetadata.type === 'A') {
      return {
        rewardMetadata: {
          type: { string },
        },
      };
    }

    const rewardAmountVariant = createVariant(() => state.value.rewardAmount, 'type', [
      {
        type: { literal: literal('fixed') },
        amount: { required, string },
      },
      {
        type: { literal: literal('dynamic') },
        stepID: { required, number },
        percentage: { required, number },
      },
    ]);

    return {
      rewardAmount: rewardAmountVariant.value,
      rewardMetadata: {
        type: { string },
      },
    };
  });
</script>

<template>
  <div class="container p-3">
    <div
      v-if="r$.rewardAmount !== undefined && narrowVariant(r$.rewardAmount, 'type', 'fixed')"
      class="py-2 has-validation"
    >
      <input
        v-model="r$.rewardAmount.amount.$value"
        class="form-control"
        placeholder="rewardAmount.amount"
        aria-describedby="name-error"
      />
    </div>
  </div>
</template>
<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

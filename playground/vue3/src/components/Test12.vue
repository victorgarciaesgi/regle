<script setup lang="ts">
  import { createVariant, useRegle } from '@regle/core';
  import { email, literal, maxLength, maxValue, minLength, minValue, required, string, url } from '@regle/rules';
  import { ref } from 'vue';

  interface RewardA {
    type: 'A';
    amount: number;
  }
  interface RewardB {
    type: 'B';
    stepID: number;
    percentage: number;
  }
  interface RewardC {
    type: 'C';
    code: string;
    expiryDays: number;
  }
  interface RewardD {
    type: 'D';
    multiplier: number;
    maxCap: number;
  }
  interface RewardE {
    type: 'E';
    email: string;
    bonusAmount: number;
  }
  interface RewardF {
    type: 'F';
    tierLevel: number;
    pointsPerAction: number;
  }
  interface RewardG {
    type: 'G';
    giftCardValue: number;
    currency: string;
  }
  interface RewardH {
    type: 'H';
    cashbackRate: number;
    minSpend: number;
  }
  interface RewardI {
    type: 'I';
    itemSKU: string;
    quantity: number;
  }
  interface RewardJ {
    type: 'J';
    referralCode: string;
    referralBonus: number;
  }
  interface RewardK {
    type: 'K';
    streakDays: number;
    bonusMultiplier: number;
  }
  interface RewardL {
    type: 'L';
    voucherCode: string;
    discountPercent: number;
  }
  interface RewardM {
    type: 'M';
    milestoneTarget: number;
    rewardValue: number;
  }
  interface RewardN {
    type: 'N';
    notificationURL: string;
    webhookSecret: string;
  }
  interface RewardO {
    type: 'O';
    offsetAmount: number;
    offsetCategory: string;
  }
  interface RewardP {
    type: 'P';
    pointsBalance: number;
    redemptionRate: number;
  }
  interface RewardAA {
    type: 'AA';
    powerUpID: string;
    durationSeconds: number;
  }
  interface RewardBB {
    type: 'BB';
    flashSaleTag: string;
    extraDiscountFlat: number;
  }
  interface RewardCC {
    type: 'CC';
    coinAmount: number;
    dailyCap: number;
  }
  interface RewardDD {
    type: 'DD';
    dayOfWeek: number;
    pointsDoubled: number;
  }
  interface RewardEE {
    type: 'EE';
    intervalHours: number;
    echoAmount: number;
  }
  interface RewardFF {
    type: 'FF';
    freebieItemID: string;
    windowMinutes: number;
  }
  interface RewardGG {
    type: 'GG';
    guildID: string;
    totalGrantPool: number;
  }
  interface RewardHH {
    type: 'HH';
    locationCode: string;
    proximityMeters: number;
    bonusPoints: number;
  }
  interface RewardII {
    type: 'II';
    inviteToken: string;
    maxSeats: number;
  }
  interface RewardJJ {
    type: 'JJ';
    minPayout: number;
    maxPayout: number;
  }
  interface RewardKK {
    type: 'KK';
    shareEventID: string;
    karmaPoints: number;
  }
  interface RewardLL {
    type: 'LL';
    levelThreshold: number;
    xpBoost: number;
  }
  interface RewardMM {
    type: 'MM';
    taskID: string;
    revealedMultiplier: number;
  }
  interface RewardNN {
    type: 'NN';
    lockDays: number;
    nestEggValue: number;
  }
  interface RewardOO {
    type: 'OO';
    challengeID: string;
    badgeLabel: string;
    flatReward: number;
  }
  interface RewardPP {
    type: 'PP';
    passCode: string;
    cycleLength: number;
    perksLevel: number;
  }
  interface RewardQQ {
    type: 'QQ';
    questSlug: string;
    requiredActions: number;
    rewardTokens: number;
  }
  interface RewardRR {
    type: 'RR';
    transactionRef: string;
    refundPercent: number;
  }
  interface RewardSS {
    type: 'SS';
    wheelConfigID: string;
    spinCredits: number;
  }
  interface RewardTT {
    type: 'TT';
    trailID: string;
    totalSteps: number;
    finalPrizeValue: number;
  }
  interface RewardUU {
    type: 'UU';
    featureFlag: string;
    upgradeDurationHours: number;
  }
  interface RewardVV {
    type: 'VV';
    vaultSlotID: string;
    voucherFaceValue: number;
  }

  type RewardAmount =
    | RewardA
    | RewardB
    | RewardC
    | RewardD
    | RewardE
    | RewardF
    | RewardG
    | RewardH
    | RewardI
    | RewardJ
    | RewardK
    | RewardL
    | RewardM
    | RewardN
    | RewardO
    | RewardP
    | RewardAA
    | RewardBB
    | RewardCC
    | RewardDD
    | RewardEE
    | RewardFF
    | RewardGG
    | RewardHH
    | RewardII
    | RewardJJ
    | RewardKK
    | RewardLL
    | RewardMM
    | RewardNN
    | RewardOO
    | RewardPP
    | RewardQQ
    | RewardRR
    | RewardSS
    | RewardTT
    | RewardUU
    | RewardVV;

  interface CampaignConfigStepsReward {
    rewardAmount: RewardAmount;
  }

  const state = ref<CampaignConfigStepsReward>({
    rewardAmount: { type: 'A', amount: 1 },
  });

  const { r$ } = useRegle(state, () => {
    const rewardAmountVariant = createVariant(() => state.value.rewardAmount, 'type', [
      {
        type: { literal: literal('A') },
        amount: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('B') },
        stepID: { required, minValue: minValue(1, { allowEqual: true }) },
        percentage: { required, minValue: minValue(0, { allowEqual: true }), maxValue: maxValue(100) },
      },
      {
        type: { literal: literal('C') },
        code: { required, string, minLength: minLength(4), maxLength: maxLength(32) },
        expiryDays: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('D') },
        multiplier: { required, minValue: minValue(1, { allowEqual: true }) },
        maxCap: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('E') },
        email: { required, email },
        bonusAmount: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('F') },
        tierLevel: { required, minValue: minValue(1, { allowEqual: true }), maxValue: maxValue(10) },
        pointsPerAction: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('G') },
        giftCardValue: { required, minValue: minValue(1, { allowEqual: true }) },
        currency: { required, string, minLength: minLength(3), maxLength: maxLength(3) },
      },
      {
        type: { literal: literal('H') },
        cashbackRate: { required, minValue: minValue(0, { allowEqual: true }), maxValue: maxValue(100) },
        minSpend: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('I') },
        itemSKU: { required, string, minLength: minLength(3), maxLength: maxLength(64) },
        quantity: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('J') },
        referralCode: { required, string, minLength: minLength(6), maxLength: maxLength(20) },
        referralBonus: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('K') },
        streakDays: { required, minValue: minValue(1, { allowEqual: true }) },
        bonusMultiplier: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('L') },
        voucherCode: { required, string, minLength: minLength(4), maxLength: maxLength(32) },
        discountPercent: { required, minValue: minValue(1, { allowEqual: true }), maxValue: maxValue(100) },
      },
      {
        type: { literal: literal('M') },
        milestoneTarget: { required, minValue: minValue(1, { allowEqual: true }) },
        rewardValue: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('N') },
        notificationURL: { required, url },
        webhookSecret: { required, string, minLength: minLength(16) },
      },
      {
        type: { literal: literal('O') },
        offsetAmount: { required, minValue: minValue(0, { allowEqual: true }) },
        offsetCategory: { required, string, minLength: minLength(2) },
      },
      {
        type: { literal: literal('P') },
        pointsBalance: { required, minValue: minValue(0, { allowEqual: true }) },
        redemptionRate: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('AA') },
        powerUpID: { required, string, minLength: minLength(3), maxLength: maxLength(32) },
        durationSeconds: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('BB') },
        flashSaleTag: { required, string, minLength: minLength(2), maxLength: maxLength(40) },
        extraDiscountFlat: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('CC') },
        coinAmount: { required, minValue: minValue(1, { allowEqual: true }) },
        dailyCap: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('DD') },
        dayOfWeek: { required, minValue: minValue(0, { allowEqual: true }), maxValue: maxValue(6) },
        pointsDoubled: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('EE') },
        intervalHours: { required, minValue: minValue(1, { allowEqual: true }) },
        echoAmount: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('FF') },
        freebieItemID: { required, string, minLength: minLength(3), maxLength: maxLength(64) },
        windowMinutes: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('GG') },
        guildID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        totalGrantPool: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('HH') },
        locationCode: { required, string, minLength: minLength(2), maxLength: maxLength(20) },
        proximityMeters: { required, minValue: minValue(1, { allowEqual: true }) },
        bonusPoints: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('II') },
        inviteToken: { required, string, minLength: minLength(8), maxLength: maxLength(64) },
        maxSeats: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('JJ') },
        minPayout: { required, minValue: minValue(0, { allowEqual: true }) },
        maxPayout: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('KK') },
        shareEventID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        karmaPoints: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('LL') },
        levelThreshold: { required, minValue: minValue(1, { allowEqual: true }) },
        xpBoost: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('MM') },
        taskID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        revealedMultiplier: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('NN') },
        lockDays: { required, minValue: minValue(1, { allowEqual: true }) },
        nestEggValue: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('OO') },
        challengeID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        badgeLabel: { required, string, minLength: minLength(2), maxLength: maxLength(40) },
        flatReward: { required, minValue: minValue(0, { allowEqual: true }) },
      },
      {
        type: { literal: literal('PP') },
        passCode: { required, string, minLength: minLength(4), maxLength: maxLength(32) },
        cycleLength: { required, minValue: minValue(1, { allowEqual: true }) },
        perksLevel: { required, minValue: minValue(1, { allowEqual: true }), maxValue: maxValue(5) },
      },
      {
        type: { literal: literal('QQ') },
        questSlug: { required, string, minLength: minLength(3), maxLength: maxLength(60) },
        requiredActions: { required, minValue: minValue(1, { allowEqual: true }) },
        rewardTokens: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('RR') },
        transactionRef: { required, string, minLength: minLength(6), maxLength: maxLength(64) },
        refundPercent: { required, minValue: minValue(1, { allowEqual: true }), maxValue: maxValue(100) },
      },
      {
        type: { literal: literal('SS') },
        wheelConfigID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        spinCredits: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('TT') },
        trailID: { required, string, minLength: minLength(3), maxLength: maxLength(40) },
        totalSteps: { required, minValue: minValue(2, { allowEqual: true }) },
        finalPrizeValue: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('UU') },
        featureFlag: { required, string, minLength: minLength(3), maxLength: maxLength(60) },
        upgradeDurationHours: { required, minValue: minValue(1, { allowEqual: true }) },
      },
      {
        type: { literal: literal('VV') },
        vaultSlotID: { required, string, minLength: minLength(4), maxLength: maxLength(40) },
        voucherFaceValue: { required, minValue: minValue(1, { allowEqual: true }) },
      },
    ]);

    return {
      rewardAmount: rewardAmountVariant.value,
    };
  });

  async function submit() {
    const { valid, data } = await r$.$validate();
    if (valid) {
      console.log(data);
    } else {
      console.warn('Errors: ', r$.$errors);
    }
  }
</script>

<template>
  <div class="container p-3">
    <h2>Hello Regle!</h2>

    {{ { errors: r$.$errors } }}

    <div v-if="r$.$value.rewardAmount.type === 'A'" class="py-2 has-validation">
      <label class="form-label">rewardAmount.amount</label>
      <input
        v-model="r$.$value.rewardAmount.amount"
        class="form-control"
        placeholder="rewardAmount.amount"
        aria-describedby="name-error"
      />
    </div>

    <button class="btn btn-primary m-2" @click="submit"> Submit </button>
    <button class="btn btn-secondary" @click="r$.$reset({ toInitialState: true })"> Restart </button>
    <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
  </div>
</template>

<style>
  @import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
</style>

<template>
  <main class="grid gap-4 p-6">
    <!-- {{ payload }} -->
    <NuxtLink to="/">Home</NuxtLink>
    <label class="grid gap-1">
      Root field 001
      <input class="border" v-model="r$.field_001.$value" />
    </label>

    <label class="grid gap-1">
      Nested field 001
      <textarea
        v-if="r$.field_015.$each[1]?.field_018.$each[0]"
        class="border"
        rows="10"
        style="width: 600px"
        v-model="r$.field_015.$each[1].field_018.$each[0].field_001.$value"
      />
    </label>

    <div class="flex items-center gap-3">
      <button tag="button" @click="submit">Validate payload</button>
      <span>Valid: {{ validationResult }}</span>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { payload } from './payload';
  import { number, required, string } from '@regle/rules';

  const clone = <T>(value: T): T => structuredClone(value);

  const values = ref(clone(payload));

  const rules = {
    field_001: { required, string },
    field_002: { required, string },
    field_003: { required, number },
    field_004: { required, number },
    field_005: { required, string },
    field_006: { required, string },
    field_007: { required, string },
    field_008: { required, string },
    field_009: { required, string },
    field_010: {
      field_001: { required, string },
      field_011: { required, number },
      field_002: { required, string },
      field_012: { required, string },
    },
    field_013: { required, string },
    field_015: {
      $each: {
        field_016: { required, string },
        field_017: { required, string },
        field_018: {
          $each: {
            field_001: { required, string },
            field_019: { required, string },
            field_022: {
              $each: {
                field_001: { required, string },
                field_026: { required, string },
                field_025: { required, string },
                field_021: { required, string },
                field_029: { required, number },
              },
            },
            field_023: {
              $each: {
                field_001: { required, string },
                field_002: { required, string },
                field_026: { required, string },
                field_030: {
                  $each: {
                    required,
                    string,
                  },
                },
                field_031: { required, string },
              },
            },
            field_024: {
              $each: {},
            },
          },
        },
      },
    },
    field_032: { required, string },
  };

  const validationResult = ref('not run');
  const { r$ } = useRegle(values, rules, { rewardEarly: true });

  const submit = async () => {
    const result = await r$.$validate();
    validationResult.value = String(result.valid);
  };
</script>

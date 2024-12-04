<template>
  <div>
    <div
      class="fixed top-5 right-5 bg-gray-800 border border-gray-600 w-[450px] h-[calc(100vh-50px)] overflow-x-hidden overflow-y-auto text-sm p-4 rounded text-gray-400"
    >
      <pre>{{ r$.$fields.shipmentItems.$each[0].$fields.name.$rules.required }}</pre>
    </div>

    <h1 class="font-bold text-2xl text-gray-200">New Shipment</h1>

    <div class="bg-gray-800 shadow-lg rounded-lg p-5 mt-5">
      <h2 class="font-semibold">Shipment Data</h2>

      <!-- Shipment Reference Number -->
      <div class="mt-4 flex flex-col gap-2">
        <div class="flex gap-2">
          <label class="font-medium uppercase text-xs text-gray-400"
            >Shipment Reference Number</label
          >
          <span class="text-red-600 relative -top-1" v-if="r$.$fields.referenceNumber.$isRequired"
            >*</span
          >
        </div>

        <input
          v-model="form.referenceNumber"
          type="text"
          class="w-1/2 ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
        />

        <FieldError :errors="r$.$errors.referenceNumber" />
      </div>

      <!-- Shipment Items -->
      <h3 class="font-semibold my-4">Shipment Items</h3>

      <div
        v-for="(field, index) in r$.$fields.shipmentItems.$each"
        :key="field.$id"
        class="border border-dashed border-gray-600 p-4 rounded-lg mt-4"
      >
        <h3 class="font-semibold uppercase text-xs text-gray-400 mb-3"> Item {{ index + 1 }} </h3>

        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Item Name</label>
              <span class="text-red-600 relative -top-1" v-if="field.$fields.name.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="field.$fields.name.$value"
              type="text"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="field.$fields.name.$errors" />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Quantity</label>
              <span class="text-red-600 relative -top-1" v-if="field.$fields.quantity.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="field.$fields.quantity.$value"
              type="number"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="field.$fields.quantity.$errors" />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Weight</label>
              <span class="text-red-600 relative -top-1" v-if="field.$fields.weight.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="field.$fields.weight.$value"
              type="number"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="field.$fields.weight.$errors" />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <button
        @click="save"
        class="bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>

      <button
        @click="fillFormWithValidValues"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Fill Form
      </button>

      <button
        @click="someCondition = !someCondition"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Toggle Condition: {{ someCondition ? 'ON' : 'OFF' }}
      </button>

      <button
        @click="someNumber++"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Some Number: {{ someNumber }}
      </button>

      <button
        @click="addShipmentItem"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Add Shipment Item
      </button>

      <button
        @click="removeLastShipmentItem"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Remove Shipment Item
      </button>

      <button
        @click="resetValidation"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Reset Validation
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required, minLength, minValue, applyIf, withMessage, withParams } from '@regle/rules';
import {
  defineRegleConfig,
  type RegleComputedRules,
  type RegleExternalErrorTree,
} from '@regle/core';
import { computed, nextTick, ref } from 'vue';
import FieldError from './FieldError.vue';

const isSaving = ref(false);
const someCondition = ref(true);
const someNumber = ref(4);

interface Form {
  referenceNumber: string;
  shipmentItems: {
    name: string;
    quantity: number;
    weight: number | string;
  }[];
}

const form = ref<Form>({
  referenceNumber: '',
  shipmentItems: [
    { name: '', quantity: 0, weight: 0 },
    { name: '', quantity: 0, weight: 0 },
  ],
});

const externalErrors = ref<RegleExternalErrorTree<Form>>({});

const { useRegle } = defineRegleConfig({
  shortcuts: {
    fields: {
      $isRequired: (field) => !!field.$rules.required?.$active,
    },
  },
});

const minWeightRule = () => {
  return withMessage(
    withParams(
      (value) => {
        return Number(value) >= someNumber.value && someCondition.value === false;
      },
      [someCondition]
    ),
    `Not good ${someNumber.value}`
  );
};

// Test index & argument
const extraWeightRule = (myArg: string, index: number) => {
  return withMessage(
    withParams(
      (value) => {
        return Number(value) > 1 && someCondition.value === false;
      },
      [someCondition]
    ),
    `totally_not_good ${myArg + index}`
  );
};

const rules = computed(() => {
  return {
    shipmentItems: {
      $each: (_, index) => {
        console.log(index);
        return {
          name: {
            required: applyIf(someCondition, required),
            // minLength: applyIf(someCondition, minLength(3)),
          },
        };
        // quantity: {
        //   minValue: minValue(1),
        //   extraWeightRule: extraWeightRule('quantity banana', index),
        // },
        // weight: {
        //   required,
        //   minWeight: minWeightRule(),
        //   extraWeightRule: extraWeightRule('weight banana', index),
        // },
      },
    },
  } satisfies RegleComputedRules<typeof form>;
});

const { r$ } = useRegle(form, rules, {
  externalErrors,
  autoDirty: true,
  clearExternalErrorsOnChange: true,
});

const addShipmentItem = async () => {
  form.value.shipmentItems.push({ name: '', quantity: 1, weight: '' });

  await nextTick();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
};

const removeLastShipmentItem = async () => {
  form.value.shipmentItems.splice(form.value.shipmentItems.length - 1, 1);

  await nextTick();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
};

const scrollToErrors = async () => {
  await nextTick();

  setTimeout(() => {
    const firstErrorElement = document.querySelector('.field-error');

    if (firstErrorElement) {
      window.scrollTo({
        top: firstErrorElement?.getBoundingClientRect().top + 100,
        behavior: 'smooth',
      });
    }
  }, 100);
};

const save = async () => {
  const { result } = await r$.$validate();

  if (!result) {
    scrollToErrors();
    return;
  }

  isSaving.value = true;

  await new Promise((resolve) => setTimeout(resolve, 500));

  /* externalErrors.value = {
          referenceNumber: ['Backend says reference number is invalid'],
          shipmentItems: {
              $each: [
                  {
                      name: ['Backend says shipmentItem[0].name is invalid'],
                  },
              ],
          }
      } */

  isSaving.value = false;

  scrollToErrors();
};

const resetValidation = () => {
  r$.$reset();
};

const fillFormWithValidValues = () => {
  resetValidation();

  someCondition.value = false;

  form.value.referenceNumber = '123';
  form.value.shipmentItems[0].name = 'Banana';
  form.value.shipmentItems[0].quantity = 223;
  form.value.shipmentItems[0].weight = 33;

  form.value.shipmentItems[1].name = 'Apple';
  form.value.shipmentItems[1].quantity = 36;
  form.value.shipmentItems[1].weight = 4;
};
</script>

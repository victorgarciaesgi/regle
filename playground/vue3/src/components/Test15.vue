<template>
  <div>
    <h1 class="font-bold text-2xl text-gray-200">New Shipment</h1>

    <div class="bg-gray-800 shadow-lg rounded-lg p-5 mt-5">
      <h2 class="font-semibold">Shipment Data</h2>

      <!-- Shipment Reference Number -->
      <div class="mt-4 flex flex-col gap-2">
        <div class="flex gap-2">
          <label class="font-medium uppercase text-xs text-gray-400">Shipment Reference Number</label>
          <span class="text-red-600 relative -top-1" v-if="r$.$fields.referenceNumber.$isRequired">*</span>
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
        v-for="(_, index) in form.shipmentItems"
        :key="index"
        class="border border-dashed border-gray-600 p-4 rounded-lg mt-4"
      >
        <h3 class="font-semibold uppercase text-xs text-gray-400 mb-3"> Item {{ index + 1 }} </h3>

        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Item Name</label>
              <span
                class="text-red-600 relative -top-1"
                v-if="r$.$fields.shipmentItems.$each[index].$fields.name.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="form.shipmentItems[index].name"
              type="text"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="r$.$errors.shipmentItems.$each[index].name" />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Quantity</label>
              <span
                class="text-red-600 relative -top-1"
                v-if="r$.$fields.shipmentItems.$each[index].$fields.quantity.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="form.shipmentItems[index].quantity"
              type="number"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="r$.$errors.shipmentItems.$each[index].quantity" />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Weight</label>
              <span
                class="text-red-600 relative -top-1"
                v-if="r$.$fields.shipmentItems.$each[index].$fields.weight.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="form.shipmentItems[index].weight"
              type="number"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="r$.$errors.shipmentItems.$each[index].weight" />
          </div>
        </div>
      </div>

      <!-- Address -->
      <h3 class="font-semibold my-4">Address</h3>

      <!-- Address Street -->
      <div class="flex flex-col gap-2">
        <div class="flex gap-1">
          <label class="font-medium uppercase text-xs text-gray-400">Street</label>
          <span class="text-red-600 relative -top-1" v-if="r$.$fields.address.$fields.street.$isRequired">*</span>
        </div>

        <input
          v-model="form.address.street"
          type="text"
          class="w-1/2 ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
        />
        <FieldError :errors="r$.$errors.address.street" />
      </div>

      <div
        v-for="(_, index) in form.address.cities"
        :key="index"
        class="border border-dashed border-gray-600 p-4 rounded-lg mt-4"
      >
        <h3 class="font-semibold uppercase text-xs text-gray-400 mb-3"> City {{ index + 1 }} </h3>

        <div v-if="true" class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">City Name</label>
              <span
                class="text-red-600 relative -top-1"
                v-if="r$.$fields.address.$fields.cities.$each[index].$fields.cityName.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="form.address.cities[index].cityName"
              type="text"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="r$.$errors.address.cities.$each[index].cityName" />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-400">Population</label>
              <span
                class="text-red-600 relative -top-1"
                v-if="r$.$fields.address.$fields.cities.$each[index].$fields.population.$isRequired"
                >*</span
              >
            </div>

            <input
              v-model="form.address.cities[index].population"
              type="number"
              class="ring-1 ring-gray-600 bg-gray-700 text-gray-300 rounded outline-none p-2"
            />
            <FieldError :errors="r$.$errors.address.cities.$each[index].population" />
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
        @click="toggleActiveRules"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Toggle active rules <i>({{ activeRules }})</i>
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
        @click="getDirtyFields"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Get Dirty Fields
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

      <button
        @click="resetFormValuesToDefault"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Reset Form Values
      </button>

      <button
        @click="triggerManualValidationForField"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Trigger validation for address.cities[0].cityName field
      </button>

      <button
        @click="resetManualValidationForField"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Reset validation for address.cities[0].cityName field
      </button>

      <button
        @click="touchFieldManually"
        class="ml-2 bg-gray-600 text-gray-200 px-10 py-3 rounded mt-6 hover:bg-gray-700 hover:active:bg-gray-900 transition"
      >
        Touch address.cities[0].cityName field
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required, minLength, minValue, applyIf, requiredIf } from '@regle/rules';
import {
  defineRegleConfig,
  createRule,
  type RegleComputedRules,
  type RegleExternalErrorTree,
  type Maybe,
} from '@regle/core';
import { computed, nextTick, ref, type Ref } from 'vue';
import FieldError from './FieldError.vue';

const isSaving = ref(false);
const someCondition = ref(true);
const someNumber = ref(4);
const activeRules = ref('rules1');

interface Form {
  referenceNumber: string;
  address: {
    street: string;
    cities: {
      cityName: string;
      population: number;
    }[];
  };
  shipmentItems: {
    name: string;
    quantity: number;
    weight: number | string;
  }[];
}

const form = ref<Form>({
  referenceNumber: '',
  address: {
    street: '',
    cities: [
      { cityName: '', population: 0 },
      { cityName: '', population: 0 },
    ],
  },
  shipmentItems: [
    { name: '', quantity: 0, weight: 0 },
    { name: '', quantity: 0, weight: 0 },
  ],
});

const resetFormValuesToDefault = () => {
  form.value.referenceNumber = '';
  form.value.shipmentItems = [];
  form.value.shipmentItems.push({ name: '', quantity: 0, weight: 0 });
  form.value.shipmentItems.push({ name: '', quantity: 0, weight: 0 });
};

const externalErrors = ref<RegleExternalErrorTree<Form>>({});

const { useRegle } = defineRegleConfig({
  shortcuts: {
    fields: {
      $isRequired: (field) => !!field.$rules.required?.$active,
    },
  },
});

const minWeightRule = createRule({
  validator(value: Maybe<number | string>, min: number, condition: boolean) {
    return Number(value) >= min && condition === false;
  },

  message: ({ $params: [min, condition] }) => {
    return `Error ${min} ${condition}`;
  },
});

const extraWeightRule = createRule({
  validator(value: Maybe<number | string>, myArg: string, index: number) {
    return Number(value) > 1;
  },

  message: ({ $params: [myArg, index] }) => {
    return 'Hello';
  },
});

const customCityName = createRule({
  validator(value: Maybe<string>, item: any) {
    console.log('item: ', item);
    return value === 'LA';
  },

  message: ({ $params: [item] }) => {
    const itemStringified = JSON.stringify(item);
    return 'City name must be LA' + itemStringified;
  },
});

function returnRules(
  item: Ref<{
    cityName: string;
    population: number;
  }>,
  index: number
) {
  const requiredOnlyIfFullSave = requiredIf(() => {
    console.log('verify');
    return Object.entries(item.value).some(([key, value]) => !!value);
  });
  return {
    cityName: {
      required: requiredOnlyIfFullSave,
      minLength: minLength(index),
      customCityName: customCityName(item),
    },
    population: {
      required: requiredOnlyIfFullSave,
      minValue: minValue(index),
    },
  };
}

const rules1 = computed(() => {
  return {
    address: {
      street: {
        required,
        minLength: minLength(3),
      },
      cities: {
        $each: (item, index) => {
          return returnRules(item, index);
        },
      },
    },
    shipmentItems: {
      $each: (_, index) => ({
        name: {
          required: applyIf(someCondition, required),
          minLength: applyIf(someCondition, minLength(3)),
        },
        quantity: {
          minValue: minValue(1),
          extraWeightRule: extraWeightRule('quantity banana', index),
        },
        weight: {
          required,
          minWeight: minWeightRule(someNumber, someCondition),
          extraWeightRule: extraWeightRule('weight banana', index),
        },
      }),
    },
  } satisfies RegleComputedRules<typeof form>;
});

const rules2 = computed(() => {
  return {
    address: {
      street: {
        required,
      },
      cities: {
        $each: (item, index) => ({
          cityName: {
            required,
          },
        }),
      },
    },
  } satisfies RegleComputedRules<typeof form>;
});

const rules = computed(() => {
  if (activeRules.value === 'rules1') {
    return rules1.value;
  } else {
    return rules2.value;
  }
});

const { r$ } = useRegle(form, rules, { externalErrors, autoDirty: true, clearExternalErrorsOnChange: true });

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

const getDirtyFields = () => {
  console.log(r$.$extractDirtyFields());
};

const scrollToErrors = async () => {
  await nextTick();

  setTimeout(() => {
    const firstErrorElement = document.querySelector('.field-error');

    if (firstErrorElement) {
      window.scrollTo({ top: firstErrorElement?.getBoundingClientRect().top + 100, behavior: 'smooth' });
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

  externalErrors.value = {
    referenceNumber: ['Backend says reference number is invalid'],
    shipmentItems: {
      $each: [
        {
          name: ['Backend says shipmentItem[0].name is invalid'],
        },
      ],
    },
    address: {
      cities: {
        $each: [
          {
            cityName: ['Backend says cityName is invalid'],
          },
        ],
      },
    },
  };

  isSaving.value = false;

  scrollToErrors();
};

const resetValidation = () => {
  r$.$reset();
};

const fillFormWithValidValues = () => {
  resetValidation();
};

const triggerManualValidationForField = async () => {
  const result = await r$.$fields.address.$fields.cities.$each[0].$fields.cityName.$validate();

  console.log('validation result: ', result);
};

const resetManualValidationForField = () => {
  r$.$fields.address.$fields.cities.$each[0].$fields.cityName.$reset();
};

const touchFieldManually = () => {
  r$.$fields.address.$fields.cities.$each[0].$fields.cityName.$touch();
};

const toggleActiveRules = () => {
  activeRules.value = activeRules.value === 'rules1' ? 'rules2' : 'rules1';
};
</script>

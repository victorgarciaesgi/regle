<template>
  <div>
    <h1 class="font-bold text-2xl">New Shipment</h1>

    <div class="bg-white shadow-lg rounded-lg p-5 mt-5">
      <h2 class="font-semibold">Shipment Data</h2>

      <!-- Shipment Reference Number -->
      <div class="mt-4 flex flex-col gap-2">
        <div class="flex gap-2">
          <label class="font-medium uppercase text-xs text-gray-700"
            >Shipment Reference Number</label
          >
        </div>

        <input
          v-model="form.referenceNumber.name.foo"
          type="text"
          class="w-1/2 ring-1 ring-gray-300 rounded outline-none p-2"
        />
        <pre>{{ r$.$errors.referenceNumber.name }}</pre>
      </div>

      <!-- Shipment Items -->
      <h3 class="font-semibold my-4">Shipment Items</h3>

      <div
        v-for="(field, index) in r$.$fields.shipmentItems.$each"
        class="border border-dashed border-gray-300 p-4 rounded-lg mt-4"
      >
        <h3 class="font-semibold uppercase text-xs text-gray-700 mb-3"> Item {{ index + 1 }} </h3>

        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="flex flex-col gap-2">
            <div class="flex gap-1">
              <label class="font-medium uppercase text-xs text-gray-700">Item Name</label>
            </div>

            <input
              v-model="field.$fields.name.$value"
              type="text"
              class="ring-1 ring-gray-300 rounded outline-none p-2"
            />
            <pre>{{ r$.$errors.shipmentItems.$each[index].name }}</pre>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <button
        type="button"
        @click="submit"
        class="bg-blue-500 text-white px-10 py-3 rounded mt-6 hover:bg-blue-600 transition"
      >
        Save
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegleExternalErrorTree } from '@regle/core';
import { inferRules, useRegle } from '@regle/core';
import { ref } from 'vue';

interface Form {
  referenceNumber: { name: { foo: '' } };
  shipmentItems: {
    name: string;
  }[];
}

const form = ref<Form>({
  referenceNumber: { name: { foo: '' } },
  shipmentItems: [{ name: '' }, { name: '' }],
});

const externalErrors = ref<RegleExternalErrorTree<Form>>({});
const { r$ } = useRegle(form, {}, { externalErrors });

async function submit() {
  const { result } = await r$.$validate();
  console.log(result);
  if (result) {
    externalErrors.value = {
      referenceNumber: {
        name: {
          foo: ['fzeflzefjlfe'],
        },
      },
      // referenceNumber: ['Backend says reference number is invalid'],
      shipmentItems: {
        $each: [
          {},
          {
            name: ['Backend says shipmentItem[0].name is invalid'],
          },
        ],
      },
    };
  }
}
</script>

<style lang="scss" scoped></style>

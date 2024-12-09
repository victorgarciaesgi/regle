<template>
  <div class="px-6 text-gray-900 antialiased">
    <div class="mx-auto max-w-xl divide-y py-12 md:max-w-4xl">
      <div class="py-12 flex flex-col justify-center items-center">
        <h2 class="text-2xl font-bold">Simple</h2>
        <div class="mt-8 w-96 max-w-md">
          <div class="grid grid-cols-1 gap-6">
            <label class="block">
              <span class="text-gray-700">Full name</span>
              <input
                v-model="r$.$value.fullName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="John Dupond"
              />
              <FieldError :errors="r$.$fields.fullName.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">Email address</span>
              <input
                v-model="r$.$value.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="john@example.com"
              />
              <FieldError :errors="r$.$fields.email.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">When is your event?</span>
              <input
                v-model="r$.$value.eventDate"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <FieldError :errors="r$.$fields.eventDate.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">What type of event is it?</span>
              <select
                v-model="r$.$value.eventType"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option>Corporate event</option>
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Other</option>
              </select>
              <FieldError :errors="r$.$fields.eventType.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">Additional details</span>
              <textarea
                v-model="r$.$value.details"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows="3"
              ></textarea>
              <FieldError :errors="r$.$fields.details.$errors" />
            </label>
            <div class="block">
              <div class="mt-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      type="checkbox"
                      class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:ring-offset-0"
                      checked
                    />
                    <span class="ml-2">I accept terms and conditions</span>
                  </label>
                  <FieldError :errors="r$.$fields.acceptTC.$errors" />
                </div>
              </div>
            </div>
            <div class="flex justify-end">
              <button
                class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import {
  and,
  checked,
  dateAfter,
  dateBefore,
  email,
  minLength,
  required,
  withMessage,
} from '@regle/rules';
import FieldError from './components/FieldError.vue';

interface Form {
  fullName?: string;
  email?: string;
  eventDate?: Date;
  eventType?: string;
  details?: string;
  acceptTC?: boolean;
}

const { r$ } = useRegle({} as Form, {
  fullName: { required, minLength: minLength(6) },
  email: { required, email },
  eventDate: { required, dateBefore: dateBefore(new Date()) },
  eventType: { required },
  details: { minLength: minLength(100) },
  acceptTC: {
    required: withMessage(and(required, checked), 'You must accept the terms and conditions'),
  },
});

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    alert(data);
  }
}
</script>

<style lang="scss" scoped></style>

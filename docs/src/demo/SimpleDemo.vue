<script setup lang="ts">
import { useRegle } from '@regle/core';
import { and, checked, dateBefore, email, minLength, required, withMessage } from '@regle/rules';
import FieldError from './FieldError.vue';
import { withTooltip } from '@regle/rules';

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
  eventDate: {
    required,
    dateBefore: withTooltip(dateBefore(new Date()), ({ $dirty }) => {
      if (!$dirty) return 'You must put a date before today';
      return '';
    }),
  },
  eventType: { required },
  details: {
    minLength: withMessage(
      minLength(100),
      ({ $value, $params: [min] }) => `Your details are too short: ${$value?.length}/${min}`
    ),
  },
  acceptTC: {
    $autoDirty: true,
    required: withMessage(and(required, checked), 'You must accept the terms and conditions'),
  },
});

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    alert('Your form is valid!');
    console.log(data);
    //           ^ Hover type here to see type safe result
  }
}
</script>

<template>
  <div class="text-gray-900 antialiased p-6 bg-neutral-900 mt-8 rounded-md">
    <div class="mx-auto max-w-xl divide-y md:max-w-4xl">
      <div>
        <div class="grid grid-cols-1 gap-2">
          <label class="block">
            <span class="text-gray-400">Full name</span>
            <input
              v-model="r$.$value.fullName"
              type="text"
              class="mt-1 block w-full text-gray-200 rounded-md bg-zinc-800 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
              placeholder="John Dupond"
            />
            
            <FieldError :errors="r$.$fields.fullName.$errors" />
          </label>

          <label class="block">
            <span class="text-gray-400">Email address</span>

            <input
              v-model="r$.$value.email"
              type="email"
              class="mt-1 block w-full text-gray-200 rounded-md bg-zinc-800 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
              placeholder="john@example.com"
            />

            <FieldError :errors="r$.$fields.email.$errors" />
          </label>

          <label class="block">
            <span class="text-gray-400">When is your event?</span>
            <input
              v-model="r$.$value.eventDate"
              type="date"
              class="mt-1 block w-full text-gray-200 rounded-md bg-zinc-800 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
            />

            <FieldError :errors="r$.$fields.eventDate.$errors" />

            <ul v-if="r$.$fields.eventDate.$tooltips.length" class="text-sm text-gray-400 mt-1">
              <li v-for="tooltip of r$.$fields.eventDate.$tooltips" :key="tooltip">{{ tooltip }}</li>
            </ul>
          </label>

          <label class="block">
            <span class="text-gray-400">What type of event is it?</span>
            <select
              v-model="r$.$value.eventType"
              class="mt-1 block w-full text-gray-200 rounded-md bg-zinc-800 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
            >
              <option disabled value="undefined" selected>Select an event</option>
              <option value="Corporate">Corporate event</option>
              <option value="Wedding">Wedding</option>
              <option value="Borthday">Birthday</option>
              <option value="Other">Other</option>
            </select>
            <FieldError :errors="r$.$fields.eventType.$errors" />
          </label>

          <label class="block">
            <span class="text-gray-400">Additional details</span>
            <textarea
              v-model="r$.$value.details"
              class="mt-1 block w-full text-gray-200 rounded-md bg-zinc-800 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
              rows="3"
            ></textarea>
            <FieldError :errors="r$.$fields.details.$errors" />
          </label>

          <div class="block">
            <div class="mt-2">
              <div>
                <label class="inline-flex items-center">
                  <input
                    v-model="r$.$value.acceptTC"
                    type="checkbox"
                    class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 focus:ring-offset-0"
                  />
                  <span class="ml-2 text-gray-400">I accept terms and conditions</span>
                </label>
                <FieldError :errors="r$.$fields.acceptTC.$errors" />
              </div>
            </div>
          </div>

          <div class="flex justify-between">
            <button
              class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
              @click="r$.$resetAll">
              Reset
            </button>

            <button
              class="bg-[#027d56] text-white hover:bg-[#048d62] font-semibold py-2 px-4 rounded shadow"
              @click="submit">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

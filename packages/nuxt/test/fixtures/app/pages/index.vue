<template>
  <div class="px-6 text-gray-900 antialiased">
    <div class="mx-auto max-w-xl divide-y py-12 md:max-w-4xl">
      <div class="py-12 flex flex-col justify-center items-center">
        <h2 class="text-2xl font-bold">Simple Regle</h2>
        <div class="mt-8 w-96 max-w-md">
          <div class="grid grid-cols-1 gap-6">
            <label class="block">
              <span class="text-gray-700">Full name</span>
              <input
                v-model="r$.$value.fullName"
                data-testid="field-fullName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="John Dupond"
              />
              <FieldError data-testid="field-fullName-errors" :errors="r$.fullName.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">Email address</span>
              <input
                v-model="r$.$value.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="john@example.com"
              />
              <FieldError :errors="r$.email.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">When is your event?</span>
              <input
                v-model="r$.$value.eventDate"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <FieldError :errors="r$.eventDate.$errors" />
              <ul v-if="r$.eventDate.$tooltips.length" class="text-sm text-gray-400 mt-1">
                <li v-for="tooltip of r$.eventDate.$tooltips" :key="tooltip">{{ tooltip }}</li>
              </ul>
            </label>
            <label class="block">
              <span class="text-gray-700">What type of event is it?</span>
              <select
                v-model="r$.$value.eventType"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option disabled value="undefined" selected>Select an event</option>
                <option value="Corporate">Corporate event</option>
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Other">Other</option>
              </select>
              <FieldError :errors="r$.eventType.$errors" />
            </label>
            <label class="block">
              <span class="text-gray-700">Additional details</span>
              <textarea
                v-model="r$.$value.details"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
                rows="3"
              ></textarea>
              <FieldError :errors="r$.details.$errors" />
            </label>
            <div class="block">
              <div class="mt-2">
                <div>
                  <label class="inline-flex items-center">
                    <input
                      v-model="r$.$value.acceptTC"
                      data-testid="acceptTC-checkbox"
                      type="checkbox"
                      class="rounded-sm border-gray-300 text-indigo-600 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50 focus:ring-offset-0"
                    />
                    <span class="ml-2">I accept terms and conditions</span>
                  </label>
                  <FieldError :errors="r$.acceptTC.$errors" />
                </div>
              </div>
            </div>
            <div class="flex justify-between">
              <button
                class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-sm shadow"
                @click="r$.$reset({ toInitialState: true })"
              >
                Reset
              </button>
              <button
                class="bg-indigo-500 text-white hover:bg-indigo-600 font-semibold py-2 px-4 rounded-sm shadow"
                @click="submit"
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
import { minLength, required, email, dateBefore, and, checked } from '@regle/rules';

interface Form {
  fullName?: string;
  email?: string;
  eventDate?: Date;
  eventType?: string;
  details?: string;
  acceptTC?: boolean;
  eventFile: File;
}

const { r$ } = useRegle({ fullName: 'Hello' } as Form, {
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
    $rewardEarly: true,
    required: withMessage(and(required, checked), 'You must accept the terms and conditions'),
  },
  eventFile: { required },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    alert('Your form is valid!');
  }
}
</script>

<style lang="scss" scoped></style>

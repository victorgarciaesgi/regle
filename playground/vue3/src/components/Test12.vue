<template>
  <h2>Activities</h2>
  <pre>{{ r$?.$errors }}</pre>

  <div v-for="(activity, index) in r$.$fields.activities.$each" :key="index">
    <!-- Sport activity card -->
    <div v-if="activity.$value.type === 'sport'">
      <label>
        Sport Name:
        <input type="text" v-model="activity.$value.name" />
      </label>
      <label>
        Experience:
        <input type="number" v-model="activity.$value.experience" />
      </label>
    </div>

    <!-- Intellectual activity card  -->
    <div v-else-if="activity.$value.type === 'intellectual'">
      <label>
        Activity Name:
        <input type="text" v-model="activity.$value.name" />
      </label>
      <label>
        Description:
        <input type="text" v-model="activity.$value.description" />
      </label>
    </div>
  </div>

  <button @click="validate">Validate</button>
  <button @click="addSportActivity" type="button">Add sport activity</button>
  <button @click="addIntellectualActivity" type="button"> Add intellectual activity </button>
</template>

<script setup lang="ts">
import * as v from 'valibot';
import * as z from 'zod';
import { useRegleSchema } from '@regle/schemas';
import { ref, toRaw } from 'vue';

// ------------------------------------
//           Valibot setup
// ------------------------------------

// Sports
const sport = v.object({
  type: v.literal('sport'),
  name: v.pipe(v.string(), v.nonEmpty()),
  experience: v.pipe(v.number()),
});

// Intellectual (reading, etc.)
const intellectual = v.object({
  type: v.literal('intellectual'),
  name: v.pipe(v.string(), v.nonEmpty()),
  // These are different, hence the variant (discriminated union in Zod) <-
  description: v.pipe(v.string(), v.nonEmpty()),
});

// Variant of sports and intellectual activities into one activity type
// https://valibot.dev/guides/unions/

const activity = v.variant('type', [sport, intellectual]);

// Person's main validation schema
const validationSchema = v.object({
  activities: v.array(activity),
});

// ------------------------------------
//             Zod setup
// ------------------------------------

const zSport = z.object({
  type: z.literal('sport'),
  name: z.string().min(1),
  experience: z.number(),
});

const zIntellectual = z.object({
  type: z.literal('intellectual'),
  name: z.string().min(1),
  description: z.string().min(1),
});

const zActivity = z.discriminatedUnion('type', [zSport, zIntellectual]);

const zValidationSchema = z.object({
  activities: z.array(zActivity),
});

// ------------------------------------
//             Form setup
// ------------------------------------

// Setup the Regle instance
const formState = ref<v.InferInput<typeof validationSchema>>({
  activities: [],
});

// Regle instance
const { r$ } = useRegleSchema(formState, validationSchema, {
  // After enabling rewardEarly, it causs the errors from these complex fields to merge in a weird way
  rewardEarly: true,
});

// Validate the form
const validate = async () => {
  const res = await r$.$validate();
  console.log(res);
  console.log(v.parse(validationSchema, toRaw(formState.value)));
};

const addSportActivity = () => {
  formState.value.activities.push({
    type: 'sport',
    name: '',
    experience: undefined as any,
  });
};

// Add a new intellectual activity with default values
const addIntellectualActivity = () => {
  formState.value.activities.push({
    type: 'intellectual',
    name: '',
    description: '',
  });
};
</script>

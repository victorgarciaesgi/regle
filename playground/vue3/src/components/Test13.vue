<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 500px">
    <input v-model="r$.$value.name" />

    <!-- Array field -->
    <div style="border: 1px solid; padding: 14px" v-for="field in r$.array.$each">
      <input type="text" :key="field.$id" v-model="field.$value.test" />
      <ul v-if="field.test.$errors.length">
        <li v-for="error of field.$errors.test" :key="error">
          {{ error }}
        </li>
      </ul>
      <!-- Nested array field -->
      <div style="border: 1px solid; padding: 14px; margin-top: 15px" v-for="nested_field in field.nested_array.$each">
        <input type="text" :key="nested_field.$id" v-model="nested_field.$value.rest" />
        <ul v-if="nested_field.rest.$errors.length">
          <li v-for="error of nested_field.$errors.rest" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <button @click="addTopLevel">Add one top level array field</button>
    <button @click="moveTopLevelUp">Move last up</button>
    <button @click="submit">Submit me!</button>
  </div>
</template>

<script setup lang="ts">
  import { useRegle, type DumbJoinDiscriminatedUnions } from '@regle/core';
  import { minLength, withMessage } from '@regle/rules';
  import { useRegleSchema } from '@regle/schemas';
  import { ref } from 'vue';
  import { z } from 'zod';

  export interface WorkConditions {
    /**
     *
     * @type {Availability}
     * @memberof WorkConditions
     */
    availability: any;
  }

  export interface Hybrid extends WorkConditions {
    /**
     *
     * @type {PostalAddress}
     * @memberof Hybrid
     */
    address: string;
    /**
     *
     * @type {number}
     * @memberof Hybrid
     */
    frequency: number;
  }

  export interface OnSite extends WorkConditions {
    /**
     *
     * @type {string}
     * @memberof OnSite
     */
    address: string;
  }

  export interface Remote extends WorkConditions {
    /**
     *
     * @type {string}
     * @memberof Remote
     */
    address?: string;
  }

  const state = ref<DumbJoinDiscriminatedUnions<Hybrid | OnSite | Remote>>({} as any);

  const { r$ } = useRegle(state, {});

  const submit = async () => {
    const res = await r$.$validate();
    console.log(res);
  };

  const addTopLevel = () => {
    r$.$value.array.push({ test: '', nested_array: [{ rest: '' }] });
  };

  // Moves the top level array's item one index higher within the array
  const moveTopLevelUp = () => {
    r$.$value.array.unshift(r$.$value.array.pop()!);
  };
</script>

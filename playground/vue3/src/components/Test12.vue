<template>
  <div class="demo-container">
    <div class="list">
      <div v-for="(item, index) of r$.collection.$each" :key="item.$id" class="item">
        <div class="field">
          <input
            v-model="item.$value.name"
            :class="{ valid: item.name.$correct, error: item.name.$error }"
            placeholder="Type an item value"
          />

          <div v-if="form.collection.length > 1" class="delete" @click="form.collection.splice(index, 1)">🗑️</div>
        </div>

        <ul v-if="item.name.$errors.length">
          <li v-for="error of item.name.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <ul v-if="r$.$errors.collection.$self.length">
      <li v-for="error of r$.$errors.collection.$self" :key="error">
        {{ error }}
      </li>
    </ul>

    <div class="button-list">
      <button type="button" @click="form.collection.push({ name: '' })">🆕 Add item</button>
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate()">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRegle } from '@regle/core';
  import { ref } from 'vue';
  import { minLength, required } from '@regle/rules';

  const form = ref<{ collection: Array<{ name: string }> | null }>({
    collection: null,
  });

  const { r$ } = useRegle(form, {
    collection: {
      // $rewardEarly avoid the error being display too soon
      $rewardEarly: true,
      minLength: minLength(4),
      $each: {},
    },
  });
</script>

<style lang="scss"></style>

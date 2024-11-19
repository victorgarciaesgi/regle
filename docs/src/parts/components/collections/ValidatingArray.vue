<template>
  <div class="demo-container">
    <div class="list">
      <div v-for="(item, index) of regle.$fields.collection.$each" :key="item.$id" class="item">
        <div class="field">
          <input
            v-model="item.$value.name"
            :class="{ valid: item.$fields.name.$valid, error: item.$fields.name.$error }"
            placeholder="Type an item value"
          />
          <div v-if="form.collection.length > 1" @click="form.collection.splice(index, 1)">❌</div>
        </div>
        <ul v-if="item.$fields.name.$errors.length">
          <li v-for="error of item.$fields.name.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <ul v-if="errors.collection.$errors.length">
      <li v-for="error of errors.collection.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
    <div class="button-list">
      <button type="button" @click="form.collection.push({ name: '' })">🆕 Add item</button>
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { minLength, required } from '@regle/rules';

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

const { errors, regle, resetAll } = useRegle(form, {
  collection: {
    minLength: minLength(4),
    $each: {
      name: { required },
    },
  },
});
</script>

<style lang="scss"></style>

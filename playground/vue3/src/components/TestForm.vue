<template>
  <div class="demo-container">
    <div>
      <div v-for="(item, index) of regle.$fields.collection.$each" :key="index">
        <div>
          <input
            v-model="item.$value.name"
            :class="{ valid: item.$fields.name.$valid }"
            placeholder="Type an item value"
          />
          <ul v-if="item.$fields.name.$errors.length">
            <li v-for="error of item.$fields.name.$errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <button type="button" @click="resetAll">Reset</button>
    <button type="button" @click="form.collection.push({ name: '' })">Add item</button>
    <button type="button" @click="removeRandomItem">Remove random item</button>

    <pre>{{ regle }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { required } from '@regle/rules';

const form = ref<{ collection: Array<{ name: '' }> }>({
  collection: [{ name: '' }],
});

function removeRandomItem() {
  form.value.collection.splice(Math.floor(Math.random() * form.value.collection.length), 1);
}

const { regle, resetAll } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
</script>

<style lang="scss"></style>

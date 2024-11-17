<template>
  <div class="demo-container">
    <div class="list">
      <div v-for="item of regle.$fields.collection.$each" :key="item.$id" class="item">
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
    <div class="button-list">
      <button type="button" @click="form.collection.push({ name: '' })">Add item</button>
      <button :disabled="form.collection.length < 2" type="button" @click="removeRandomItem"
        >Remove random item</button
      >
      <button type="button" @click="form.collection = shuffle(form.collection)">Suffle</button>
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { minLength, required } from '@regle/rules';

function shuffle(arr: any[], options?: any) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }
  if (arr.length < 2) {
    return arr;
  }
  var shuffleAll = options && options.shuffleAll;
  var result = arr.slice();
  var i = arr.length,
    rand,
    temp;
  while (--i > 0) {
    do {
      rand = Math.floor(Math.random() * (i + 1));
    } while (shuffleAll && rand == i);
    if (!shuffleAll || rand != i) {
      temp = result[i];
      result[i] = result[rand];
      result[rand] = temp;
    }
  }
  return result;
}

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

function removeRandomItem() {
  form.value.collection.splice(Math.floor(Math.random() * form.value.collection.length), 1);
}

const { errors, regle, resetAll } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
</script>

<style lang="scss"></style>

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
          {{ item.name.$dirty }}

          <div v-if="form.collection.length > 1" class="delete" @click="form.collection.splice(index, 1)">🗑️</div>
        </div>

        <ul v-if="item.name.$errors.length">
          <li v-for="error of item.name.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <div class="button-list">
      <button type="button" @click="form.collection.push({ name: '' })">🆕 Add item</button>
      <button :disabled="form.collection.length < 2" type="button" @click="removeRandomItem">
        Remove random item
      </button>
      <button type="button" @click="form.collection.splice(2, 0, { name: 'hihi' })">Insert</button>
      <button type="button" @click="r$.$reset({ toInitialState: true })">Reset</button>
      <button class="primary" type="button" @click="r$.$validate">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { required } from '@regle/rules';

function shuffle(arr: any[], options?: any) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array');
  }

  if (arr.length < 2) {
    return arr;
  }

  const shuffleAll = options && options.shuffleAll;
  const result = arr.slice();

  let i = arr.length,
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
  collection: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
});

function removeRandomItem() {
  form.value.collection.splice(Math.floor(Math.random() * form.value.collection.length), 1);
}

const { r$ } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
</script>

<style lang="scss"></style>

---
title: Collections rules
---

<script setup>
import DisplayingCollectionErrors from '../parts/components/collections/DisplayingCollectionErrors.vue';
</script>

# Collections rules


## Declaring rules for collection

Your forms can often contain collections validations. Where you need to validate multiple items sharing nested shape. It can easily be done with `$each` in the rules declaration.

You can also add validation for the field containing the array.

:::warning
Due to Javascript limitations with [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), it's recommanded to use only arrays of objects.
Primitives (Strings, Numbers etc...) are immutable, so they can't be modified to add a track id (the way Regle works).
As the original array can't be tracked properly. So you will lose the `$dirty` state of your field if you replace the array. It can work with mutable methods like `push` or `splice`.
:::

```ts twoslash
import {useRegle} from '@regle/core';
import {ref} from 'vue';
import {required} from '@regle/rules';
// ---cut---
const form = ref<{collection: Array<{name: string}>}>({
  collection: []
})

const {regle, errors} = useRegle(form, {
  collection: {
    $each: {
      name: {required},
    }
  }
})
```

## Displaying collections errors

For collections, the best way to display errors is to bind your list to the `$each` linked to your state. In this exemple `regle.$fields.collection.$each`.

But you can also map your errors to the `errors.collection.$each`.

```vue twoslash
<template>
  <div class="demo-container">
    <div class="list">
      <div v-for="(item, index) of regle.$fields.collection.$each" :key="item.$id" class="item">
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
      <button type="button" @click="resetAll">Reset</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { required } from '@regle/rules';

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

const { regle, errors, resetAll } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
</script>
```

Result: 

<DisplayingCollectionErrors/>
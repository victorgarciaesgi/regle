---
title: Working with arrays - Declaring rules
description: API usage of $each
---

<script setup>
import DisplayingCollectionErrors from '../parts/components/collections/DisplayingCollectionErrors.vue';
import AccessingCurrentItemState from '../parts/components/collections/AccessingCurrentItemState.vue';
import ValidatingArray from '../parts/components/collections/ValidatingArray.vue';
</script>

# Validating arrays

## Declaring rules for collections

Your forms may often include validations for collections where you need to validate multiple items sharing a nested structure. This can be easily achieved using `$each` in the rules declaration.

You can also add validations for the field containing the array itself.

:::warning
Due to a JavaScript limitation with [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), it's recommended to use only arrays of objects.

Primitives (Strings, Numbers etc...) are immutable, so they can't be modified to add a tracking ID (which is how Regle works for collections).
:::

```ts twoslash
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { required } from '@regle/rules';
// ---cut---
const form = ref<{ collection: { name: string }[] }>({
  collection: []
})

const { r$ } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    }
  }
})
```


## Displaying collection errors

For collections, the best way to display errors is to bind your list to the `$each` linked to your state. In this example, `r$.$fields.collection.$each`.

Alternatively, you can map your errors using `r$.$errors.collection.$each`.

```vue twoslash
<template>
  <div 
    v-for="item of r$.$fields.collection.$each" 
    :key="item.$id">
    <div>
      <input
        v-model="item.$value.name"
        :class="{ valid: item.$fields.name.$correct }"
        placeholder="Type an item value"
      />

      <ul>
        <li v-for="error of item.$fields.name.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>

  <button type="button" @click="form.collection.push({ name: '' })">Add item</button>
  <button type="button" @click="r$.$reset({toInitialState: true})">Reset</button>
</template>

<script setup lang="ts">
//---cut---
import { ref } from 'vue';
import { required } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref<{ collection: { name: string }[] }>({
  collection: [{ name: '' }],
});

const { r$ } = useRegle(form, {
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


:::warning

If your array is empty, Regle can't know if it's supposed to be considered a field or a collection, only type-wise. Be sure to declare even an `$each` object in the client rules to tell Regle that the array is to be treated as a collection.

```ts
const { r$ } = useRegle({collection: [] as {name: string}}, {
  collection: {
    $each: {}
  },
})
```

:::


## Validating the array independently

Sometimes, you may want to validate not only each field in every element of the array but also the array itself, such as its size.

You can do this just like you would with a normal field.

Errors can be displayed either using `r$.$errors.[field].$self` or `r$.$fields.[field].$self.$errors`.


```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, minLength } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

const { r$ } = useRegle(form, {
  collection: {
    $rewardEarly: true,
    minLength: minLength(4),
    $each: {
      name: { required },
    },
  },
});
```

Result:

<ValidatingArray />


## Accessing the current item state

In each item of your collection, you may have a validation that depends on another property of the item.
You can access the current item's state and index by providing a function callback to `$each`.

```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, requiredIf } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref({
  collection: [{ name: '', condition: false }],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: (item, index) => ({
      name: { required: requiredIf(() => item.value.condition) },
    }),
  },
});
```

Result:

<AccessingCurrentItemState />

## Providing a custom key to track items

By default, Regle generates a random ID to track your items and maintain their state through mutations. This ID is stored in `$id` and can be used in Vue as a `key` for rendering.

You can also provide your own key to the rule for custom tracking:


```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, requiredIf } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref({
  collection: [{ name: '', uuid: '28xja83' }],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: (item) => ({
      $key: item.value.uuid,
      name: { required },
    }),
  },
});
```

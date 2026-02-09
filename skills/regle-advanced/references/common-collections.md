# Validating Collections

Use `$each` in the rules to validate arrays of objects.

## Declaring rules

```ts
const form = ref<{ collection: { name: string }[] }>({
  collection: [],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
```

**Important**: Only use arrays of objects (not primitives). Primitives are immutable and can't be tracked by Regle.

If the array is empty, always declare `$each` (even empty) so Regle knows it's a collection:

```ts
{ collection: { $each: {} } }
```

## Displaying collection errors

Bind to `r$.collection.$each`:

```vue
<template>
  <div v-for="item of r$.collection.$each" :key="item.$id">
    <input
      v-model="item.$value.name"
      :class="{ valid: item.name.$correct }"
    />
    <ul>
      <li v-for="error of item.name.$errors" :key="error">{{ error }}</li>
    </ul>
  </div>

  <button @click="form.collection.push({ name: '' })">Add item</button>
</template>
```

## Validating the array itself

Add rules alongside `$each` (e.g., array size):

```ts
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

Array-level errors: `r$.$errors.collection.$self` or `r$.collection.$self.$errors`.

## Accessing current item state

Use a function callback for `$each` to access the current item and index:

```ts
const { r$ } = useRegle(form, {
  collection: {
    $each: (item, index) => ({
      name: { required: requiredIf(() => item.value.condition) },
    }),
  },
});
```

## Custom tracking key

Provide a custom key instead of the auto-generated `$id`:

```ts
const { r$ } = useRegle(form, {
  collection: {
    $each: (item) => ({
      $key: item.value.uuid,
      name: { required },
    }),
  },
});
```

# Scoped Validation

Collect validation from multiple components without DOM restrictions.

## Basic setup

### `useScopedRegle`

Like `useRegle`, but registers the instance for collection by a parent scope:

```vue
<!-- Child1.vue -->
<script setup>
import { useScopedRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useScopedRegle({ firstName: '' }, {
  firstName: { required },
});
</script>
```

### `useCollectScope`

Collects all `useScopedRegle` instances in the same scope:

```vue
<!-- Parent.vue -->
<script setup>
import { useCollectScope } from '@regle/core';

const { r$ } = useCollectScope();
// r$.$value, r$.$errors are arrays of collected instances
// r$.$invalid, r$.$error reflect combined state
</script>
```

## Multiple scopes

Create isolated scopes with `createScopedUseRegle`:

```ts
import { createScopedUseRegle } from '@regle/core';

export const { useScopedRegle, useCollectScope } = createScopedUseRegle();

// Separate scope for another form section
export const {
  useScopedRegle: useContactsRegle,
  useCollectScope: useCollectContacts,
} = createScopedUseRegle();
```

## Namespaces

Filter collected instances by namespace:

```ts
// In child component
const { r$ } = useScopedRegle({ name: '' }, { name: { required } }, {
  namespace: 'contacts',
});

// In parent -- only collect 'contacts' namespace
const { r$ } = useCollectScope('contacts');

// Or collect multiple namespaces
const { r$ } = useCollectScope(['contacts', 'persons']);
```

## Inject global config

Pass a custom `useRegle` from `defineRegleConfig`:

```ts
const { useRegle } = defineRegleConfig({ /* ... */ });

export const { useScopedRegle, useCollectScope } = createScopedUseRegle({
  customUseRegle: useRegle,
});
```

## Custom store

Provide your own ref for collected instances:

```ts
import { type ScopedInstancesRecordLike, createScopedUseRegle } from '@regle/core';

const myStore = ref<ScopedInstancesRecordLike>({});
const { useScopedRegle, useCollectScope } = createScopedUseRegle({ customStore: myStore });
```

## Record mode

Store instances as a record instead of an array:

```ts
const { useScopedRegle, useCollectScope } = createScopedUseRegle({ asRecord: true });

// Each child must provide an id
const { r$ } = useScopedRegle({ name: '' }, { name: { required } }, { id: 'child1' });
```

## Manual dispose/register

```ts
const { r$, dispose, register } = useScopedRegle({ name: '' }, { name: { required } });

// Remove from parent scope
dispose();

// Re-register
register();
```

## Testing

Mount components with `attachTo`:

```ts
const wrapper = mount(Component, { attachTo: document.documentElement });
```

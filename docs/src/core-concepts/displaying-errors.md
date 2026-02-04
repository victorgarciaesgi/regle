---
title: Displaying errors
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
import QuickUsageCustom from '../parts/components/QuickUsageCustom.vue';
import DisplayingErrors from '../parts/components/DisplayingErrors.vue';
</script>

# Displaying errors

Regle is a headless library, allowing you to display error messages in any way you choose. You can also use its internal state to apply classes or trigger behaviors dynamically.


## Showing errors messages

You can display your errors by iterating though `r$.xxx.$errors`, `xxx` being the field you need to check.

You can also access `r$.$errors.xxx` or `r$.$silentErrors.xxx`.

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage />


## Display custom error messages

To display custom error messages, you can use the [withMessage](/core-concepts/rules/rule-wrappers#withmessage) helper.   
You have access to additional data like parameters or rule status to write your message.

:::tip
If you fall into this case:
- You have a lot of forms in your app
- You want to share translations easily between your forms

Consider using [defineRegleConfig](/advanced-usage/global-config#replace-built-in-rules-messages) instead.
:::

``` vue [App.vue]
<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { required, minLength, email, withMessage } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { 
    required: withMessage(required, 'Missing value'), 
    email: withMessage(email, 'Try a valid email?'), 
    minLength: withMessage(minLength(4), ({$params: [min]}) => `It needs ${min} characters`)}
})
</script>
```

<QuickUsageCustom/>


## i18n and translations

Regle is library agnostic so you can use any i18n library freely, and there is nothing specific to configure, it will just work out of the box.

```vue
<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { required, minLength, email, withMessage } from '@regle/rules';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const { r$ } = useRegle({ email: '' }, {
  email: { 
    required: withMessage(required, t('general.required')), 
    email: withMessage(email, t('general.email')), 
    minLength: withMessage(minLength(4), ({$params: [min]}) => t(`general.minLength`, {min}))}
})
</script>

```


## Applying an error and valid class

<!-- @include: @/parts/DisplayingErrors.md -->

Result:

<DisplayingErrors />



## Get errors by path

If you need to access errors for a specific field using a dot-notation path, you can use the `getErrors` utility. This is useful when you need to programmatically access errors or when building reusable input components.

```ts twoslash
import { getErrors, useRegle } from '@regle/core';
import { required, email } from '@regle/rules';

const { r$ } = useRegle(
  { user: { email: '' }, contacts: [{ name: '' }] },
  {
    user: { email: { required, email } },
    contacts: { $each: { name: { required } } }
  }
);

await r$.$validate();

// Access nested errors with dot notation
const emailErrors = getErrors(r$, 'user.email');
// ['This field is required']

// Access collection item errors
const contactErrors = getErrors(r$, 'contacts.$each.0.name');
// ['This field is required']
```

:::tip
The path parameter is **type-safe** - TypeScript will autocomplete available paths and show an error if you try to access a path that doesn't exist or isn't a field with errors.
:::


## Get issues by path

Similar to `getErrors`, the `getIssues` utility returns detailed validation issues including metadata like the rule name and custom properties.

```ts twoslash
import { getIssues, useRegle } from '@regle/core';
import { required, minLength } from '@regle/rules';

const { r$ } = useRegle(
  { user: { name: '' } },
  { user: { name: { required, minLength: minLength(3) } } }
);

await r$.$validate();

const nameIssues = getIssues(r$, 'user.name');
// [{
//   $message: 'This field is required',
//   $property: 'name',
//   $rule: 'required',
//   $type: 'required'
// }]
```


## Display flat errors

If you want to display the complete list of errors of a form, or the total count of errors, you can use the `flatErrors` utility.

It will return an array of error strings.

```ts
import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '', level0: { email: 'bar' } },
  {
    name: { required, minLength: minLength(5) },
    level0: {
      email: { email },
    },
  }
);

r$.$validate();

const flattenErrors = flatErrors(r$.$errors);
//     [
//      "This field is required", 
//      "Value must be an valid email address"
//     ]
```


### `includePath` option

This helper also include an option to have the path of the property and returns the issues in Standard Schema Issue format.


```ts
import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '', level0: { email: 'bar' } },
  {
    name: { required, minLength: minLength(5) },
    level0: {
      email: { email },
    },
  }
);

r$.$validate();

const flattenErrors = flatErrors(r$.$errors, {includePath: true});
//     [
//       { message: "This field is required", path: ["name"] }, 
//       { message: "Value must be an valid email address", path: ["level0", "email"]}
//     ]
```

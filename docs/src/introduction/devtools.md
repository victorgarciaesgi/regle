# Regle Devtools

Regle offers a devtools extension for [Vue Devtools](https://devtools.vuejs.org/) to help you debug your validation tree.

![Regle Devtools Screenshot](/screenshots/devtools.png)


## Installation

To enable devtools, you need to install the Regle plugin in your app.

:::tip
If you use the `@regle/nuxt` module, the devtools will be automatically enabled.
:::

```ts [main.ts]
import { createApp } from 'vue';
import App from './App.vue';
import { RegleVuePlugin } from '@regle/core';

const app = createApp(App);

app.use(RegleVuePlugin); // <--

app.mount('#app');
```

## Usage

Regle devtools can inspect every variation of `useRegle`:

- `useRegle`
- `useRules`
- `useRegleSchema`
- `useScopedRegle`
- `useScopedRegleSchema`

You can inspect every nested properties and rules of the `r$` instance.

:::warning
Rules inspection is not available for `useRegleSchema`
:::

### Actions

You can perform actions on the `r$` instance by clicking on the actions buttons in the devtools.

![Devtools Actions Screenshot](/screenshots/devtools-actions.png)


- Validate: Validate the `r$` instance (with `$validate` method)
- Reset validation state: Reset the validation state of the `r$` instance (with `$reset` method)
- Restore to original state: Restore the `r$` instance to the original state (with `$reset` method)



## Providing custom `r$` ids to devtools

By default, the devtools will use a generic name to display the `r$` instance. 

You can provide a custom name to the `useRegle` composable to display a more descriptive name in the devtools.

```ts [App.vue]
import { useRegle } from '@regle/core';

const { r$ } = useRegle({ name: '' }, {
  name: { required }
}, {
  id: 'my-form'
});
```
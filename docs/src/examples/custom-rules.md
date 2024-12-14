---
title: Custom Rules
---

# Custom Rules Demo

You can create your own custom rules either by using an inline function or the `createRule` utility. It is recommended to create custom rules using the `createRule` function rather than an inline function because it automatically tracks reactive dependencies and enables you to add custom `active` behavior to the rule.

<a target='_blank' href="https://stackblitz.com/~/github.com/martinszeltins/regle-example-custom-rules">
  <img
    alt="Open in StackBlitz"
    src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
  />
</a>

<iframe style='width: 100%; height: 700px' src="https://stackblitz.com/github/martinszeltins/regle-example-custom-rules?embed=1&file=src%2FApp.vue&theme=dark&view=preview" title="Sandbox editor" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

---
title: Displaying errors
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
import DisplayingErrors from '../parts/components/DisplayingErrors.vue';
</script>

# Displaying errors

Regle is a headless library, allowing you to display error messages in any way you choose. You can also use its internal state to apply classes or trigger behaviors dynamically.


## Showing errors messages

You can display your errors by iterating though `r$.$errors.xxx`, `xxx` being the field you need to check.

You can also access `r$.$fields.xxx.$errors` or `r$.$fields.xxx.$silentErrors`.

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage />


## Applying an error and valid class

<!-- @include: @/parts/DisplayingErrors.md -->

Result:

<DisplayingErrors />

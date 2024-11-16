---
title: Displaying errors
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
import DisplayingErrors from '../parts/components/DisplayingErrors.vue';
</script>

# Displaying errors

Regle is a headless library, so you can display your errors message however you want.
You can also trigger classes or beahviour depending of the internal `regle` state.


## Showing errors messages

You can display your errors by iterating though `errors.xxx`, `xxx` being the field you need to check.

You can also access `regle.xxx.$errors` or `regle.xxx.$silentErrors`.

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage/>


## Applying an error and valid class

<!-- @include: @/parts/DisplayingErrors.md -->

Result:

<DisplayingErrors/>

import type { EmptyObject } from 'type-fest';
import type {
  DeepPartial,
  HasNamedKeys,
  PromiseReturn,
  RegleCommonStatus,
  RegleResult,
  RegleValidationErrors,
  ResetOptions,
  SuperCompatibleRegleRoot,
} from '../types';
import { computed, reactive, watchEffect } from 'vue';

export type MergedRegles<
  TRegles extends Record<string, SuperCompatibleRegleRoot>,
  TValue = {
    [K in keyof TRegles]: TRegles[K]['$value'];
  },
> = Omit<
  RegleCommonStatus,
  '$value' | '$silentValue' | '$errors' | '$silentErrors' | '$name' | '$unwatch' | '$watch' | '$extractDirtyFields'
> & {
  /** Map of merged Regle instances and their properties  */
  readonly $instances: { [K in keyof TRegles]: TRegles[K] };
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: TValue;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: TValue;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: {
    [K in keyof TRegles]: TRegles[K]['$errors'];
  };
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: {
    [K in keyof TRegles]: TRegles[K]['$silentErrors'];
  };
  readonly $issues: {
    [K in keyof TRegles]: TRegles[K]['$issues'];
  };
  readonly $silentIssues: {
    [K in keyof TRegles]: TRegles[K]['$silentIssues'];
  };
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TValue>[];
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: (forceValues?: TRegles['$value']) => Promise<MergedReglesResult<TRegles>>;
} & (HasNamedKeys<TRegles> extends true ? { [K in keyof TRegles]: TRegles[K] } : {});

export type MergedScopedRegles<TValue extends Record<string, unknown>[] = Record<string, unknown>[]> = Omit<
  MergedRegles<Record<string, SuperCompatibleRegleRoot>, TValue>,
  '$instances' | '$errors' | '$silentErrors' | '$value' | '$silentValue' | '$validate' | '$extractDirtyFields'
> & {
  /** Array of scoped Regles instances  */
  readonly $instances: SuperCompatibleRegleRoot[];
  /** Collection of all registered Regles instances values */
  readonly $value: TValue;
  /** Collection of all registered Regles instances errors */
  readonly $errors: RegleValidationErrors<Record<string, unknown>>[];
  /** Collection of all registered Regles instances silent errors */
  readonly $silentErrors: RegleValidationErrors<Record<string, unknown>>[];
  /** Collection of all registered Regles instances issues */
  readonly $issues: RegleValidationErrors<Record<string, unknown>, false, true>[];
  /** Collection of all registered Regles instances silent issues */
  readonly $silentIssues: RegleValidationErrors<Record<string, unknown>, false, true>[];
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TValue>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: (forceValues?: TValue) => Promise<{
    valid: boolean;
    data: TValue;
    errors: RegleValidationErrors<Record<string, unknown>>[];
    issues: RegleValidationErrors<Record<string, unknown>>[];
  }>;
};

type MergedReglesResult<TRegles extends Record<string, SuperCompatibleRegleRoot>> =
  | {
      valid: false;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { valid: false }>['data'];
      };
      errors: {
        [K in keyof TRegles]: TRegles[K]['$errors'];
      };
      issues: {
        [K in keyof TRegles]: TRegles[K]['$issues'];
      };
    }
  | {
      valid: true;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { valid: true }>['data'];
      };
      errors: EmptyObject;
      issues: EmptyObject;
    };

/**
 * Merge multiple Regle instances into a single validation state.
 * Useful for combining multiple forms or validation scopes.
 *
 * @param regles - An object containing named Regle instances to merge
 * @param _scoped - Internal flag for scoped validation (default: false)
 * @returns A merged validation state with all instances' properties combined
 *
 * @example
 * ```ts
 * import { useRegle, mergeRegles } from '@regle/core';
 * import { required } from '@regle/rules';
 *
 * // Create separate validation instances
 * const { r$: personalInfo } = useRegle(
 *   { name: '', email: '' },
 *   { name: { required }, email: { required } }
 * );
 *
 * const { r$: address } = useRegle(
 *   { street: '', city: '' },
 *   { street: { required }, city: { required } }
 * );
 *
 * // Merge them together
 * const merged$ = mergeRegles({
 *   personalInfo,
 *   address
 * });
 *
 * // Access combined state
 * merged$.$valid           // true when ALL forms are valid
 * merged$.$errors          // { personalInfo: {...}, address: {...} }
 * await merged$.$validate() // Validates all forms
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/merge-regles Documentation}
 */
export function mergeRegles<TRegles extends Record<string, SuperCompatibleRegleRoot>, TScoped extends boolean = false>(
  regles: TRegles,
  _scoped?: TScoped
): TScoped extends false ? MergedRegles<TRegles> : MergedScopedRegles {
  const scoped = _scoped == null ? false : _scoped;

  const $value = computed({
    get: () => {
      if (scoped) {
        return Object.values(regles).map((r) => r.$value);
      } else {
        return Object.fromEntries(Object.entries(regles).map(([key, r]) => [key, r.$value]));
      }
    },
    set: (value) => {
      if (!scoped) {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([key, newValue]) => (regles[key].$value = newValue));
        }
      }
    },
  });

  const $silentValue = computed({
    get: () => Object.fromEntries(Object.entries(regles).map(([key, r]) => [key, r.$silentValue])),
    set: (value) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([key, newValue]) => (regles[key].$silentValue = newValue));
      }
    },
  });

  const $dirty = computed<boolean>(() => {
    const entries = Object.entries(regles);
    return (
      !!entries.length &&
      entries.every(([_, regle]) => {
        return regle?.$dirty;
      })
    );
  });

  const $anyDirty = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$anyDirty;
    });
  });

  const $invalid = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$invalid;
    });
  });

  const $correct = computed<boolean>(() => {
    const entries = Object.entries(regles);

    return (
      !!entries.length &&
      entries.every(([_, regle]) => {
        return regle?.$correct || (regle.$anyDirty && !regle.$invalid);
      })
    );
  });

  const $error = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$error;
    });
  });

  const $ready = computed<boolean>(() => {
    const entries = Object.entries(regles);

    return (
      !!entries.length &&
      entries.every(([_, regle]) => {
        return regle?.$ready;
      })
    );
  });

  const $pending = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$pending;
    });
  });

  const $issues = computed(() => {
    if (scoped) {
      return Object.entries(regles).map(([_, regle]) => {
        return regle.$issues;
      });
    } else {
      return Object.fromEntries(
        Object.entries(regles).map(([key, regle]) => {
          return [key, regle.$issues];
        })
      );
    }
  });

  const $silentIssues = computed(() => {
    if (scoped) {
      return Object.entries(regles).map(([_, regle]) => {
        return regle.$silentIssues;
      });
    } else {
      return Object.fromEntries(
        Object.entries(regles).map(([key, regle]) => {
          return [key, regle.$silentIssues];
        })
      );
    }
  });

  const $errors = computed(() => {
    if (scoped) {
      return Object.entries(regles).map(([_, regle]) => {
        return regle.$errors;
      });
    } else {
      return Object.fromEntries(
        Object.entries(regles).map(([key, regle]) => {
          return [key, regle.$errors];
        })
      );
    }
  });

  const $silentErrors = computed(() => {
    if (scoped) {
      return Object.entries(regles).map(([_, regle]) => {
        return regle.$silentErrors;
      });
    } else {
      return Object.fromEntries(
        Object.entries(regles).map(([key, regle]) => {
          return [key, regle.$silentErrors];
        })
      );
    }
  });

  const $edited = computed<boolean>(() => {
    const entries = Object.entries(regles);

    return (
      !!entries.length &&
      entries.every(([_, regle]) => {
        return regle?.$edited;
      })
    );
  });

  const $anyEdited = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$anyEdited;
    });
  });

  const $instances = computed<TRegles | SuperCompatibleRegleRoot[]>(() => {
    if (scoped) {
      return Object.values(regles);
    } else {
      return regles;
    }
  });

  function $reset(options?: ResetOptions<unknown>) {
    Object.values(regles).forEach((regle) => {
      regle.$reset(options);
    });
  }

  function $touch() {
    Object.values(regles).forEach((regle) => {
      regle.$touch();
    });
  }

  function $extractDirtyFields(filterNullishValues: boolean = true) {
    return Object.values(regles).map((regle) => regle.$extractDirtyFields(filterNullishValues));
  }

  function $clearExternalErrors() {
    Object.values(regles).forEach((regle) => {
      regle.$clearExternalErrors();
    });
  }

  async function $validate(forceValues?: any): Promise<RegleResult<any, any> & { errors: any; issues: any }> {
    try {
      if (forceValues) {
        $value.value = forceValues;
      }
      const data = $value.value;

      const results = await Promise.allSettled(
        Object.values(regles).map((regle) => {
          return regle.$validate();
        })
      );

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value.valid === true;
        } else {
          return false;
        }
      });
      return { valid: validationResults, data, errors: $errors.value, issues: $issues.value };
    } catch {
      return { valid: false, data: $value.value, errors: $errors.value, issues: $issues.value };
    }
  }

  const fullStatus = reactive({
    ...(!scoped && {
      $silentValue: $silentValue as any,
    }),
    $errors,
    $issues,
    $silentIssues,
    $silentErrors,
    $instances,
    $value: $value as any,
    $dirty,
    $anyDirty,
    $invalid,
    $correct,
    $error,
    $pending,
    $ready,
    $edited,
    $anyEdited,
    $reset,
    $touch,
    $validate,
    $extractDirtyFields,
    $clearExternalErrors,
  } as any);

  watchEffect(() => {
    if (scoped) {
      return;
    }
    // Cleanup previous field properties
    for (const key of Object.keys(fullStatus).filter((key) => !key.startsWith('$') && !key.startsWith('~'))) {
      delete fullStatus[key as keyof typeof fullStatus];
    }
    for (const [key, field] of Object.entries($instances.value)) {
      Object.assign(fullStatus, {
        [key]: field,
      });
    }
  });

  return fullStatus;
}

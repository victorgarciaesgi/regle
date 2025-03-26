import type { PartialDeep } from 'type-fest';
import type {
  PromiseReturn,
  RegleCommonStatus,
  RegleResult,
  RegleValidationErrors,
  ResetOptions,
  SuperCompatibleRegleRoot,
} from '../types';
import { computed, reactive } from 'vue';

export type MergedRegles<
  TRegles extends Record<string, SuperCompatibleRegleRoot>,
  TValue = {
    [K in keyof TRegles]: TRegles[K]['$value'];
  },
> = Omit<
  RegleCommonStatus,
  '$value' | '$silentValue' | '$errors' | '$silentErrors' | '$name' | '$unwatch' | '$watch'
> & {
  /** Dictionnay of merged Regle instances and their properties  */
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
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TValue>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<MergedReglesResult<TRegles>>;
};

export type MergedScopedRegles<TValue extends Record<string, unknown>[] = Record<string, unknown>[]> = Omit<
  MergedRegles<Record<string, SuperCompatibleRegleRoot>, TValue>,
  '$instances' | '$errors' | '$silentErrors' | '$value' | '$silentValue' | '$validate'
> & {
  /** Array of scoped Regles instances  */
  readonly $instances: SuperCompatibleRegleRoot[];
  /** Collection of all registered Regles instances values */
  readonly $value: TValue;
  /** Collection of all registered Regles instances errors */
  readonly $errors: RegleValidationErrors<Record<string, unknown>>[];
  /** Collection of all registered Regles instances silent errors */
  readonly $silentErrors: RegleValidationErrors<Record<string, unknown>>[];
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<{ valid: boolean; data: TValue }>;
};

type MergedReglesResult<TRegles extends Record<string, SuperCompatibleRegleRoot>> =
  | {
      valid: false;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { valid: false }>['data'];
      };
    }
  | {
      valid: true;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { valid: true }>['data'];
      };
    };

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

  async function $validate(): Promise<RegleResult<any, any>> {
    try {
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
      return { valid: validationResults, data };
    } catch (e) {
      return { valid: false, data: $value.value };
    }
  }

  return reactive({
    ...(!scoped && {
      $silentValue: $silentValue as any,
    }),
    $errors,
    $silentErrors: $silentErrors,
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
}

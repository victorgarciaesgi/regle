import type { PartialDeep } from 'type-fest';
import type {
  $InternalRegleErrors,
  $InternalRegleResult,
  PromiseReturn,
  RegleCommonStatus,
  SuperCompatibleRegleRoot,
} from '../types';
import { computed, reactive, ref } from 'vue';

export type MergedSchemas<
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

type MergedReglesResult<TRegles extends Record<string, SuperCompatibleRegleRoot>> =
  | {
      result: false;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { result: false }>['data'];
      };
    }
  | {
      result: true;
      data: {
        [K in keyof TRegles]: Extract<PromiseReturn<ReturnType<TRegles[K]['$validate']>>, { result: true }>['data'];
      };
    };

export function mergeSchemas<TRegles extends Record<string, SuperCompatibleRegleRoot>>(
  regles: TRegles
): MergedSchemas<TRegles> {
  const $value = computed({
    get: () => Object.fromEntries(Object.entries(regles).map(([key, r]) => [key, r.$value])),
    set: (value) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([key, newValue]) => (regles[key].$value = newValue));
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
    return Object.entries(regles).every(([_, regle]) => {
      return regle?.$dirty;
    });
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

  const $valid = computed<boolean>(() => {
    return Object.entries(regles).every(([_, regle]) => {
      return regle?.$invalid;
    });
  });

  const $error = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$error;
    });
  });

  const $ready = computed<boolean>(() => {
    return Object.entries(regles).every(([_, regle]) => {
      return regle?.$ready;
    });
  });

  const $pending = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$pending;
    });
  });

  const $errors = computed<Record<string, $InternalRegleErrors>>(() => {
    return Object.fromEntries(
      Object.entries(regles).map(([key, regle]) => {
        return [key, regle.$errors];
      })
    );
  });

  const $silentErrors = computed<Record<string, $InternalRegleErrors>>(() => {
    return Object.fromEntries(
      Object.entries(regles).map(([key, regle]) => {
        return [key, regle.$silentErrors];
      })
    );
  });

  const $edited = computed<boolean>(() => {
    return Object.entries(regles).every(([_, regle]) => {
      return regle?.$edited;
    });
  });

  const $anyEdited = computed<boolean>(() => {
    return Object.entries(regles).some(([_, regle]) => {
      return regle?.$anyEdited;
    });
  });

  const $instances = computed(() => {
    return regles;
  });

  function $reset() {
    Object.values(regles).forEach((regle) => {
      regle.$reset();
    });
  }

  function $touch() {
    Object.values(regles).forEach((regle) => {
      regle.$touch();
    });
  }

  function $resetAll() {
    Object.values(regles).forEach((regle) => {
      regle.$resetAll();
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

  async function $validate(): Promise<$InternalRegleResult> {
    try {
      const data = $value.value;

      const results = await Promise.allSettled(
        Object.values(regles).map((regle) => {
          return regle.$validate();
        })
      );

      const validationResults = results.every((value) => {
        if (value.status === 'fulfilled') {
          return value.value.result === true;
        } else {
          return false;
        }
      });
      return { result: validationResults, data };
    } catch (e) {
      return { result: false, data: $value.value };
    }
  }

  return reactive({
    $value: $value as any,
    $silentValue: $silentValue as any,
    $dirty,
    $anyDirty,
    $invalid,
    $valid,
    $error,
    $pending,
    $errors,
    $silentErrors: $silentErrors,
    $ready,
    $edited,
    $anyEdited,
    $instances,
    $resetAll,
    $reset,
    $touch,
    $validate,
    $extractDirtyFields,
    $clearExternalErrors,
  } as any);
}

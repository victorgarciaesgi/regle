import {
  computed,
  ComputedRef,
  isRef,
  nextTick,
  Ref,
  ref,
  unref,
  UnwrapRef,
  watch,
  MaybeRef,
} from 'vue';
import { closestSibling } from '../utils/dom.utils';
import type {
  PartialValidationTree,
  RuleResultRecord,
  UseFormOptions,
  ValidationError,
  ValidationErrorTree,
} from './types';

export type UseFormReturnType<
  TData extends Record<string, any>,
  TCustomRules extends RuleResultRecord = RuleResultRecord,
  TRules extends PartialValidationTree<TData, TCustomRules> = Record<string, any>,
  TFormId extends boolean = true,
> = {
  /** Vuelidate computed validator root */
  $v: Ref<Validation<TData, UnwrapRef<TRules>>>;
  /** Editable miror of your state */
  formState: Ref<TData>;
  /** readonly miror of your rules */
  rules: ComputedRef<TRules | UnwrapRef<TRules>>;
  /** Reactive Dictionnary with every errors for each field */
  errors: Ref<ValidationErrorTree<TRules>>;
  /**
   * Re-check the form, returns a Promise with a boolean indicating if the form is valid
   * If the form is `invalid` , it will scroll the the neerest joy-form-error
   * For this to work, the field
   *
   * @param  {boolean} [scrollToErrorOverride=true] - Override scroll behaviour
   */
  validateForm: (scrollToErrorOverride?: boolean) => Promise<boolean>;
  /**
   * Reset both form values and vuelidate validators
   *
   * If using reactive factory, it will recollect reactive references and reset to newest values
   * @param {boolean} [recollectReferences=true] - Override reference recollect
   */
  resetForm: () => void;
} & (TFormId extends true ? { formId: string } : {});

export function createUseFormComposable<TCustomRules extends RuleResultRecord>(
  formatErrorMessages: (
    t: ReturnType<typeof useTranslation>['t'],
    validation?: BaseValidation
  ) => ValidationError<any>
) {
  // Overloads to support both forms with a `<form>` element and data only ones
  function useForm<
    TData extends Record<string, any>,
    TRules extends PartialValidationTree<TData, TCustomRules>,
  >(
    factory: { state: MaybeRef<TData>; rules: MaybeRef<TRules> },
    options?: UseFormOptions
  ): UseFormReturnType<TData, TCustomRules, TRules, false>;
  function useForm<
    TData extends Record<string, any>,
    TRules extends PartialValidationTree<TData, TCustomRules>,
  >(
    formId: string,
    factory: { state: MaybeRef<TData>; rules: MaybeRef<TRules> },
    options?: UseFormOptions
  ): UseFormReturnType<TData, TCustomRules, TRules, true>;
  function useForm<
    TData extends Record<string, any>,
    TRules extends PartialValidationTree<TData, TCustomRules>,
  >(
    factoryOrFormId: { state: MaybeRef<TData>; rules: MaybeRef<TRules> } | string,
    factoryOrOptions:
      | { state: MaybeRef<TData>; rules: MaybeRef<TRules> }
      | (UseFormOptions | undefined),
    maybeOptions?: UseFormOptions
  ): UseFormReturnType<TData, TCustomRules, TRules, boolean> {
    let formId: string | undefined;
    let factory: { state: MaybeRef<TData>; rules: MaybeRef<TRules> };
    let _options: UseFormOptions | undefined;

    if (typeof factoryOrFormId === 'string') {
      formId = factoryOrFormId;
      factory = factoryOrOptions as { state: MaybeRef<TData>; rules: MaybeRef<TRules> };
      _options = maybeOptions;
    } else {
      factory = factoryOrFormId;
      _options = factoryOrOptions as UseFormOptions;
    }

    const { t } = useTranslation();
    const { scrollToError = true, editable, ...customVuelidateOptions } = _options ?? {};
    const { $autoDirty = true, ...vuelidateOptions } = customVuelidateOptions;

    const formState = isRef(factory.state)
      ? factory.state
      : ref<Record<string, any>>(cloneDeep(factory.state));

    const validationState = ref({
      state: cloneDeep(factory.state),
      rules: unref(factory.rules),
    }) as Ref<{
      state: TData;
      rules: TRules | UnwrapRef<TRules>;
    }>;

    const rules = computed(() => unref(factory.rules));

    const $v = useVuelidate(rules, formState as any, { ...vuelidateOptions, $autoDirty }) as Ref<
      Validation<TData, UnwrapRef<TRules>>
    >;

    // - Form utils

    // Reset form implementation
    function resetForm(): void {
      formState.value = validationState.value.state;

      $v.value.$reset();
    }

    // Validate form with scroll implementation
    async function validateForm(scrollToErrorOverride = true) {
      if (formId) {
        const rootElement = document.getElementById(formId);
        // if (rootElement) {
        //     const result = await $v.value.$validate();
        //     const finalScrollToError = scrollToErrorOverride != null ? scrollToErrorOverride : scrollToError;

        //     if (finalScrollToError) {
        //         await nextTick();
        //         const errorElements = Array.from(rootElement.querySelectorAll('joy-form-error, .joy-form-error'));
        //         if (errorElements.length && $v.value.$invalid) {
        //             const elementsToFind = [
        //                 JOY_FORM_FIELDS.join(', '),
        //                 ...JOY_FORM_FIELDS.map((m) => `joy-label , .joy-label , div[class^='${m}'] , div[class*='${m}'] , ${m}`),
        //             ].join(', ');
        //             const elementToScrollTo = (closestSibling(errorElements[0], elementsToFind) ??
        //                 errorElements[0].closest(elementsToFind)) as HTMLElement;
        //             if (elementToScrollTo) {
        //                 elementToScrollTo.scrollIntoView({behavior: 'smooth'});
        //             }
        //             return false;
        //         }
        //     }
        //     return result;
        // } else {
        //     /* eslint-disable no-console */
        //     console.warn(`Can't find form container with id "${formId}"`);
        //     return false;
        // }
      } else {
        return await $v.value.$validate();
      }
    }

    // - Errors messages

    function processErrors(): Record<keyof TRules, string[]> {
      return collectChildrenValidations($v.value as BaseValidation);
    }

    function collectChildrenValidations(
      validation: BaseValidation
    ): Record<keyof TRules, string[]> {
      const fields = Object.entries(validation).filter(
        ([key]) => !key.startsWith('$') || key === '$each'
      ) as [string, BaseValidation][];

      return Object.fromEntries(
        fields.map(([key, value]) => {
          const isNested = Object.entries(value).some(
            ([key, field]) => field && typeof field === 'object' && '$validate' in field
          );

          if (isNested) {
            return [key, collectChildrenValidations(value as unknown as BaseValidation)];
          }
          return [key, formatErrorMessages(t, value)];
        }) as any
      ) as Record<keyof TRules, string[]>;
    }

    const errorMessages = ref(processErrors()) as Ref<Record<keyof TRules, string[]>>;

    watch(
      [$v, rules, formState],
      () => {
        errorMessages.value = processErrors();
      },
      { immediate: true, deep: true }
    );

    // - Lifecycles

    return {
      ...(formId && { formId }),
      $v,
      formState: formState as any,
      rules,
      errors: errorMessages as any,
      validateForm,
      resetForm,
    };
  }

  return useForm;
}

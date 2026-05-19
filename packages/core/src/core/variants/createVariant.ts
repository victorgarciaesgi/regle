import {
  computed,
  isRef,
  nextTick,
  ref,
  toRef,
  toValue,
  watch,
  type MaybeRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';
import { isObject } from '../../../../shared';
import type {
  DeepReactiveState,
  JoinDiscriminatedUnions,
  LazyJoinDiscriminatedUnions,
  NarrowVariant,
  NarrowVariantExtracts,
  RegleCollectionStatus,
  RegleStatus,
  VariantTuple,
} from '../../types';
import { isRuleDef } from '../useRegle/guards';

/**
 * Create variant-based validation rules that depend on a discriminant field value.
 * Useful for union types where different fields are required based on a type discriminant.
 *
 * Note: Autocomplete may not fully work due to TypeScript limitations.
 *
 * @param root - The reactive state object
 * @param discriminantKey - The key used to discriminate between variants
 * @param variants - Array of variant rule definitions using `literal` for type matching
 * @returns A computed ref containing the currently active variant rules
 *
 * @example
 * ```ts
 * import { useRegle, createVariant } from '@regle/core';
 * import { required, email, literal } from '@regle/rules';
 *
 * const state = ref({
 *   type: 'EMAIL' as 'EMAIL' | 'GITHUB',
 *   email: '',
 *   username: ''
 * });
 *
 * // ⚠️ Use getter syntax for your rules
 * const { r$ } = useRegle(state, () => {
 *   const variant = createVariant(state, 'type', [
 *     { type: { literal: literal('EMAIL') }, email: { required, email } },
 *     { type: { literal: literal('GITHUB') }, username: { required } },
 *     { type: { required } }, // Default case
 *   ]);
 *
 *   return {
 *     ...variant.value,
 *   };
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/variants Documentation}
 */
export function createVariant<
  TForm extends Record<string, any>,
  TDiscriminant extends keyof JoinDiscriminatedUnions<TForm>,
  TVariants extends VariantTuple<JoinDiscriminatedUnions<TForm>, TDiscriminant>,
>(
  root: MaybeRefOrGetter<TForm> | DeepReactiveState<TForm>,
  discriminantKey: TDiscriminant,
  variants: [...TVariants]
): Ref<TVariants[number]> {
  const watchableRoot = computed(() => (toValue(root) as JoinDiscriminatedUnions<TForm>)[discriminantKey]);

  const computedRules = computed(() => {
    const selectedVariant = variants.find((variant) => {
      if ((variant as any)[discriminantKey] && 'literal' in (variant as any)[discriminantKey]) {
        const literalRule = variant[discriminantKey]['literal'];
        if (isRuleDef(literalRule)) {
          return toValue(literalRule._params?.[0]) === watchableRoot.value;
        }
      }
    });

    if (selectedVariant) {
      return selectedVariant;
    } else {
      const anyDiscriminantRules = variants.find(
        (variant) =>
          isObject(variant[discriminantKey]) && !Object.keys(variant[discriminantKey]).some((key) => key === 'literal')
      );

      if (anyDiscriminantRules) {
        return anyDiscriminantRules;
      } else {
        return {};
      }
    }
  });

  return computedRules as any;
}

/**
 * Type guard to narrow a variant field to a specific discriminated value.
 * Enables type-safe access to variant-specific fields.
 *
 * @param root - The Regle status object
 * @param discriminantKey - The key used to discriminate between variants
 * @param discriminantValue - The specific value to narrow to
 * @returns `true` if the discriminant matches, with TypeScript narrowing the type
 *
 * @example
 * ```ts
 * import { narrowVariant } from '@regle/core';
 *
 * if (narrowVariant(r$, 'type', 'EMAIL')) {
 *   // TypeScript knows r$.email exists here
 *   r$.email.$value = 'user@example.com';
 * }
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/variants Documentation}
 */
export function narrowVariant<
  TRoot extends {
    [x: string]: unknown;
    $fields: {
      [x: string]: unknown;
    };
    $value: unknown;
  },
  const TKey extends keyof Omit<NonNullable<TRoot>, `$${string}` | `~${string}`>,
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<
      NonNullable<TRoot>[TKey],
      | RegleCollectionStatus<any, any, any>
      | RegleStatus<any, any, any>
      | NarrowVariantExtracts[keyof NarrowVariantExtracts]
    >
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: TRoot | undefined,
  discriminantKey: TKey,
  discriminantValue: TValue
): root is NarrowVariant<NonNullable<TRoot>, TKey, TValue> {
  return (
    !!root &&
    discriminantKey in root &&
    isObject(root[discriminantKey]) &&
    '$value' in root[discriminantKey] &&
    root[discriminantKey]?.$value === discriminantValue
  );
}

/**
 * Create a reactive reference to a narrowed variant.
 * Useful in templates or when you need a stable ref to the narrowed type.
 *
 * @param root - The Regle status object (can be a ref)
 * @param discriminantKey - The key used to discriminate between variants
 * @param discriminantValue - The specific value to narrow to
 * @param options - Optional `{ unsafeAssertion: true }` to assert the variant always exists
 * @returns A ref containing the narrowed variant (or undefined if not matching)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { variantToRef } from '@regle/core';
 *
 * const emailR$ = variantToRef(r$, 'type', 'EMAIL');
 *
 * // In template:
 * // <input v-if="emailR$" v-model="emailR$.$value.email" />
 * </script>
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/variants Documentation}
 */
export function variantToRef<
  TRoot extends RegleStatus<{}, any, any>,
  const TKey extends keyof TRoot['$fields'],
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<
      TRoot['$fields'][TKey],
      | RegleCollectionStatus<any, any, any>
      | RegleStatus<any, any, any>
      | NarrowVariantExtracts[keyof NarrowVariantExtracts]
    >
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: MaybeRef<TRoot>,
  discriminantKey: TKey,
  discriminantValue: TValue,
  options: {
    /**
     * Assert that the variant is always defined, use with caution
     */
    unsafeAssertion: true;
  }
): Ref<NarrowVariant<TRoot, TKey, TValue>>;
export function variantToRef<
  TRoot extends RegleStatus<{}, any, any>,
  const TKey extends keyof TRoot['$fields'],
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<
      TRoot['$fields'][TKey],
      | RegleCollectionStatus<any, any, any>
      | RegleStatus<any, any, any>
      | NarrowVariantExtracts[keyof NarrowVariantExtracts]
    >
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: MaybeRef<TRoot>,
  discriminantKey: TKey,
  discriminantValue: TValue
): Ref<NarrowVariant<TRoot, TKey, TValue> | undefined>;
export function variantToRef<
  TRoot extends RegleStatus<{}, any, any>,
  const TKey extends keyof TRoot['$fields'],
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<TRoot['$fields'][TKey], RegleCollectionStatus<any, any, any> | RegleStatus<any, any, any>>
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: MaybeRef<TRoot>,
  discriminantKey: TKey,
  discriminantValue: TValue,
  _options?: { unsafeAssertion?: boolean }
): Ref<NarrowVariant<TRoot, TKey, TValue> | undefined> {
  const fromRoot = isRef(root) ? toRef(root.value, '$fields') : toRef(root, '$fields');

  const returnedRef = ref<any>();

  watch(
    fromRoot,
    async () => {
      // avoid premature load of wrong rules resulting in a false positive
      await nextTick();
      if (narrowVariant(fromRoot.value, discriminantKey, discriminantValue)) {
        returnedRef.value = toRef(root).value;
      } else {
        returnedRef.value = undefined;
      }
    },
    { immediate: true, flush: 'pre' }
  );

  return returnedRef as any;
}

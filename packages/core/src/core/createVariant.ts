import {
  computed,
  isRef,
  nextTick,
  ref,
  toRef,
  toValue,
  unref,
  watch,
  type MaybeRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';
import { isObject } from '../../../shared';
import type {
  DeepReactiveState,
  JoinDiscriminatedUnions,
  LazyJoinDiscriminatedUnions,
  MaybeInput,
  RegleCollectionStatus,
  RegleFieldStatus,
  RegleStatus,
  VariantTuple,
} from '../types';
import { isRuleDef } from './useRegle/guards';

/**
 * Declare variations of state that depends on one value
 *
 * Autocomplete may not work here because of https://github.com/microsoft/TypeScript/issues/49547
 *
 * ```ts
 *  // ⚠️ Use getter syntax for your rules () => {} or a computed one
 *    const {r$} = useRegle(state, () => {
 *      const variant = createVariant(state, 'type', [
 *        {type: { literal: literal('EMAIL')}, email: { required, email }},
 *        {type: { literal: literal('GITHUB')}, username: { required }},
 *        {type: { required }},
 *      ]);
 *
 *      return {
 *        ...variant.value,
 *      };
 *    })
 * ```
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
          return unref(literalRule._params?.[0]) === watchableRoot.value;
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
 * Narrow a nested variant field to a discriminated value
 *
 * ```ts
 * if (narrowVariant(r$.$fields, 'type', 'EMAIL')) {
 *    r$.$fields.email.$value = 'foo';
 * }
 * ```
 */
export function narrowVariant<
  TRoot extends {
    [x: string]: unknown;
  },
  const TKey extends keyof TRoot,
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<TRoot[TKey], RegleCollectionStatus<any, any, any> | RegleStatus<any, any, any>>
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: TRoot,
  discriminantKey: TKey,
  discriminantValue: TValue
): root is Extract<
  TRoot,
  { [K in TKey]: RegleFieldStatus<TValue, any, any> | RegleFieldStatus<MaybeInput<TValue>, any, any> }
> {
  return (
    isObject(root[discriminantKey]) &&
    '$value' in root[discriminantKey] &&
    root[discriminantKey]?.$value === discriminantValue
  );
}

/**
 * Narrow a nested variant root to a reactive reference
 *
 * ```vue
 * <script setup lang="ts">
 *   const variantR$ = variantToRef(r$, 'type', 'EMAIL');
 * </script>
 * ```
 */
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
  discriminantValue: TValue
): Ref<Extract<TRoot['$fields'], { [K in TKey]: RegleFieldStatus<TValue, any, any> }> | undefined> {
  const fromRoot = isRef(root) ? toRef(root.value, '$fields') : toRef(root, '$fields');

  const returnedRef = ref<any>();

  watch(
    fromRoot,
    async () => {
      // avoid premature load of wrong rules resulting in a false positive
      await nextTick();
      if (narrowVariant(fromRoot.value, discriminantKey, discriminantValue)) {
        returnedRef.value = fromRoot.value;
      } else {
        returnedRef.value = undefined;
      }
    },
    { immediate: true, flush: 'pre' }
  );

  return returnedRef as any;
}

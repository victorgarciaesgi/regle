import {
  computed,
  isRef,
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
  RegleCollectionStatus,
  RegleFieldStatus,
  RegleStatus,
  VariantTuple,
} from '../types';
import { isRuleDef } from './useRegle/guards';

/**
 *
 * Autocomplete may not work here because of https://github.com/microsoft/TypeScript/issues/49547
 */
export function createVariant<
  TForm extends Record<string, any>,
  TDiscriminant extends keyof JoinDiscriminatedUnions<TForm>,
  TVariants extends VariantTuple<JoinDiscriminatedUnions<TForm>, TDiscriminant>,
>(
  root: MaybeRefOrGetter<TForm> | DeepReactiveState<TForm>,
  disciminantKey: TDiscriminant,
  variants: [...TVariants]
): Ref<TVariants[number]> {
  const watchableRoot = computed(() => (toValue(root) as JoinDiscriminatedUnions<TForm>)[disciminantKey]);

  const computedRules = computed(() => {
    const selectedVariant = variants.find((variant) => {
      if ((variant as any)[disciminantKey] && 'literal' in (variant as any)[disciminantKey]) {
        const literalRule = variant[disciminantKey]['literal'];
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
          isObject(variant[disciminantKey]) && !Object.keys(variant[disciminantKey]).some((key) => key === 'literal')
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
): root is Extract<TRoot, { [K in TKey]: RegleFieldStatus<TValue, any, any> }> {
  return (
    isObject(root[discriminantKey]) &&
    '$value' in root[discriminantKey] &&
    root[discriminantKey]?.$value === discriminantValue
  );
}

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
    () => {
      if (narrowVariant(fromRoot.value, discriminantKey, discriminantValue)) {
        returnedRef.value = fromRoot.value;
      } else {
        returnedRef.value = undefined;
      }
    },
    {}
  );

  return returnedRef as any;
}

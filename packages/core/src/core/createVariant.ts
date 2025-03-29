import { computed, ref, toValue, unref, watch, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue';
import type {
  DeepReactiveState,
  JoinDiscriminatedUnions,
  RegleCollectionStatus,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleStatus,
} from '../types';
import { isRuleDef, isValidatorRulesDef } from './useRegle/guards';
import { isObject } from '../../../shared';

export function createVariant<
  TForm extends Record<string, any>,
  TDiscriminant extends keyof TForm,
  const TVariants extends [ReglePartialRuleTree<TForm>, ReglePartialRuleTree<TForm>, ...ReglePartialRuleTree<TForm>[]],
>(
  root: MaybeRefOrGetter<TForm> | DeepReactiveState<TForm>,
  disciminantKey: TDiscriminant,
  variants: [...TVariants]
): Ref<TVariants[number]> {
  const watchableRoot = computed(() => toValue(root)[disciminantKey]);

  const computedRules = computed(() => {
    const selectedVariant = variants.find((variant) => {
      if (variant[disciminantKey] && 'literal' in variant[disciminantKey]) {
        const literalRule = variant[disciminantKey]['literal'];
        if (isRuleDef(literalRule)) {
          console.log(literalRule, watchableRoot.value);
          return unref(literalRule._params?.[0]) === watchableRoot.value;
        }
      }
    });

    console.log(selectedVariant);

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

  return computedRules;
}

export function discriminateVariant<
  TRoot extends RegleStatus['$fields'],
  TKey extends keyof TRoot,
  const TValue extends JoinDiscriminatedUnions<
    Exclude<TRoot[TKey], RegleCollectionStatus<any, any, any> | RegleStatus<any, any, any>>
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: TRoot,
  discriminantKey: TKey,
  discriminantValue: TValue
): root is Extract<TRoot, { [K in TKey]: RegleFieldStatus<TValue, any, any> }> {
  console.log('check disc', root[discriminantKey]?.$value);
  return root[discriminantKey]?.$value === discriminantValue;
}

import { computed, toRef, toValue, unref, type MaybeRefOrGetter, type Ref } from 'vue';
import { isObject } from '../../../shared';
import type {
  AllRulesDeclarations,
  DeepReactiveState,
  JoinDiscriminatedUnions,
  LazyJoinDiscriminatedUnions,
  RegleCollectionStatus,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../types';
import { isRuleDef } from './useRegle/guards';

type PossibleLiteralTypes<T extends Record<string, any>, TKey extends keyof T> = {
  [TVal in NonNullable<T[TKey]>]: {
    [K in TKey]-?: Omit<RegleRuleDecl<TVal, Partial<AllRulesDeclarations>>, 'literal'> & {
      literal?: RegleRuleDefinition<TVal, [literal: TVal], false, boolean, string | number>;
    };
  };
};

type RequiredForm<T extends Record<string, any>, TKey extends keyof T> = Omit<ReglePartialRuleTree<T>, TKey> &
  PossibleLiteralTypes<T, TKey>[keyof PossibleLiteralTypes<T, TKey>];

type Variant1<T extends Record<string, any>, TKey extends keyof T> = [
  RequiredForm<T, TKey>,
  ...RequiredForm<T, TKey>[],
];

/**
 *
 * Autocomplete may not work here because of https://github.com/microsoft/TypeScript/issues/49547
 */
export function createVariant<
  const TForm extends Record<string, any>,
  const TDiscriminant extends keyof JoinDiscriminatedUnions<TForm>,
  const TVariants extends Variant1<JoinDiscriminatedUnions<TForm>, TDiscriminant>,
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

export function discriminateVariant<
  TRoot extends {
    [x: string]: unknown;
  },
  TKey extends keyof TRoot,
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

export function inferVariantToRef<
  TRoot extends {
    [x: string]: unknown;
  },
  TKey extends keyof TRoot,
  const TValue extends LazyJoinDiscriminatedUnions<
    Exclude<TRoot[TKey], RegleCollectionStatus<any, any, any> | RegleStatus<any, any, any>>
  > extends { $value: infer V }
    ? V
    : unknown,
>(
  root: TRoot,
  discriminantKey: TKey,
  discriminantValue: TValue
): Ref<Extract<TRoot, { [K in TKey]: RegleFieldStatus<TValue, any, any> }>> | undefined {
  let returnedRef: Ref<any> | undefined;
  if (discriminateVariant(root, discriminantKey, discriminantValue)) {
    returnedRef = toRef(root);
  }
  return returnedRef;
}

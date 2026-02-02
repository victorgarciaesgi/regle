import {
  createRule,
  InternalRuleType,
  type FormRuleDeclaration,
  type Prettify,
  type RegleRuleDefinition,
  type RegleRuleDefinitionProcessor,
  type RegleRuleMetadataDefinition,
} from '@regle/core';
import type { IsTuple } from 'type-fest';
import { computed, effectScope, onScopeDispose, ref, type ComputedRef, type EffectScope, type Ref } from 'vue';
import { applyIf } from './applyIf';
import { extractValidator } from './common/extractValidator';
import { debounce, isObject } from '../../../shared';

type PipeTupleToObject<TArray extends unknown[]> = {
  [Key in keyof TArray as TArray[Key] extends RegleRuleDefinition<infer TType extends string, any, any>
    ? `${TType & string}`
    : `anonymous${Key & (`${number}` | (IsTuple<TArray> extends true ? never : number))}`]: TArray[Key];
};

type TRulesTuple = [FormRuleDeclaration<any>, ...FormRuleDeclaration<any>[]];
interface PipeOptions {
  debounce?: number;
}

/**
 * Creates a computed ref that checks if all previous rules have passed.
 */
function createPreviousResultsCheck(
  scope: EffectScope,
  mappedResults: Ref<Map<number, boolean>>,
  index: number
): ComputedRef<boolean> {
  return scope.run(() => {
    return computed(() => {
      if (index === 0) return true;
      return Array.from(mappedResults.value.entries())
        .slice(0, index)
        .every(([, result]) => result === true);
    });
  })!;
}

/**
 * Wraps a validator to track its result in the mappedResults map.
 * Handles both sync and async validators.
 */
function createTrackedValidator({
  validator,
  index,
  isAsync,
  mappedResults,
  options,
}: {
  validator: RegleRuleDefinitionProcessor<any, any, RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>>;
  mappedResults: Ref<Map<number, boolean>>;
  index: number;
  isAsync: boolean;
  options: PipeOptions | undefined;
}): RegleRuleDefinitionProcessor<any, any, any> {
  if (isAsync) {
    return debounce(async (value: any, ...args: any[]) => {
      mappedResults.value.set(index, false);
      const result = await validator(value, ...args);
      const isValid = typeof result === 'boolean' ? result : (result?.$valid ?? false);
      mappedResults.value.set(index, isValid);
      return result;
    }, options?.debounce ?? 200);
  }

  return (value: any, ...args: any[]) => {
    mappedResults.value.set(index, false);
    const result = validator(value, ...args);

    if (result instanceof Promise) {
      if (__IS_DEV__) {
        console.warn(
          'You used a async validator function on a non-async rule, please use "async await" or the "withAsync" helper'
        );
      }
      return false;
    }
    const isValid = typeof result === 'boolean' ? result : (result?.$valid ?? false);
    mappedResults.value.set(index, isValid);
    return result;
  };
}

/**
 * The `pipe` operator chains multiple rules together, where each rule only runs
 * if all previous rules have passed. This is useful for sequential validation
 * where later rules depend on earlier ones passing.
 *
 * @param rules - Two or more rules to chain together
 * @returns An object of rules that execute sequentially
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { pipe, required, minLength, email } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { email: '' },
 *   {
 *     email: pipe(required, minLength(5), email),
 *   }
 * );
 * // minLength only runs if required passes
 * // email only runs if both required and minLength pass
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#pipe Documentation}
 */
export function pipe<const TRulesDelc extends [FormRuleDeclaration<any>, ...FormRuleDeclaration<any>[]]>(
  ...rules: TRulesDelc
): Prettify<PipeTupleToObject<TRulesDelc>>;
export function pipe<const TRulesDelc extends [FormRuleDeclaration<any>, ...FormRuleDeclaration<any>[]]>(
  rules: TRulesDelc,
  options?: PipeOptions
): Prettify<PipeTupleToObject<TRulesDelc>>;
export function pipe(
  ...rules: TRulesTuple | [rules: TRulesTuple, options?: PipeOptions]
): Prettify<PipeTupleToObject<TRulesTuple>> {
  const remappedRules: RegleRuleDefinition<any, any, any>[] = [];
  const mappedResults = ref(new Map<number, boolean>());
  let scopes: EffectScope[] = [];

  const firstArg = rules[0];
  const filteredRules: TRulesTuple = Array.isArray(firstArg) ? firstArg : (rules as TRulesTuple);
  const filteredOptions = Array.isArray(firstArg) && isObject(rules[1]) ? (rules[1] as PipeOptions) : undefined;

  for (const [index, rule] of filteredRules.entries()) {
    const scope = effectScope();
    scopes.push(scope);

    const { _type, validator, _params, _message, _async, _active } = extractValidator(rule);

    const trackedValidator = createTrackedValidator({
      validator,
      mappedResults,
      index,
      isAsync: _async,
      options: filteredOptions,
    });

    const newRule = createRule({
      type: _type,
      validator: trackedValidator,
      active: _active,
      async: _async,
      message: _message,
    });

    newRule._params = _params;

    // Execute the rule if it has params
    let processedRule: RegleRuleDefinition<any, any, any>;
    if (typeof newRule === 'function') {
      processedRule = newRule(...(_params ?? []));
    } else {
      processedRule = newRule;
    }

    const shouldApply = createPreviousResultsCheck(scope, mappedResults, index);

    const isPreviousRuleAsync = index > 0 && remappedRules[index - 1]._async;

    const finalRule = applyIf(shouldApply, processedRule, { hideParams: !isPreviousRuleAsync });
    remappedRules.push(finalRule);
  }

  onScopeDispose(() => {
    scopes.forEach((scope) => scope.stop());
    scopes = [];
  });

  return {
    ...Object.fromEntries(
      remappedRules.map((rule, index) => {
        const key = rule.type && rule.type !== InternalRuleType.Inline ? rule.type : `anonymous${index}`;
        return [key, rule];
      })
    ),
    $debounce: 0,
  };
}

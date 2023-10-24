import { createRule, FormRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import { ExtractParamsFromRules, ExtractValueFromRules, UnwrapTuples } from '../types';

export function or<TRules extends FormRuleDeclaration<any, any>[]>(
  ...rules: [...TRules]
): RegleRuleDefinition<
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>
> {
  const isAnyRuleAsync = rules.some((rule) => {
    if (typeof rule === 'function') {
      return rule.constructor.name === 'AsyncFunction';
    } else {
      return rule._async;
    }
  });

  const params = rules
    .map((rule) => {
      if (typeof rule === 'function') {
        return null;
      } else {
        return rule._params;
      }
    })
    .flat()
    .filter((param): param is any => !!param);

  function computeRules(rules: [...TRules], value: any, ...params: any[]) {
    const $rules: any[] = [];
    let paramIndex = 0;

    for (let rule of rules) {
      if (typeof rule === 'function') {
        $rules.push(rule(value));
        paramIndex++;
      } else {
        const paramsLength = rule._params?.length ?? 0;
        $rules.push(rule.validator(value, ...params.slice(paramIndex, paramsLength)));
        if (paramsLength) {
          paramIndex += paramsLength;
        }
      }
    }

    return $rules;
  }

  const validator = isAnyRuleAsync
    ? async (value: any | null | undefined, ...params: any[]) => {
        const results = await Promise.all(computeRules(rules, value, ...params));
        return results.some((result) => !!result);
      }
    : (value: any | null | undefined, ...params: any[]) => {
        const $rules = computeRules(rules, value, ...params);
        return $rules.some((result) => !!result);
      };

  const newRule = createRule({
    type: 'or',
    validator: validator,
    message: '',
  });

  newRule._params = params;

  return newRule as RegleRuleDefinition;
}

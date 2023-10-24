import { createRule, FormRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import { ExtractValueFromRules, ExtractParamsFromRules, UnwrapTuples } from '../types';

export function and<TRules extends FormRuleDeclaration<any, any>[]>(
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

  const _params = rules
    .map((rule) => {
      if (typeof rule === 'function') {
        return null;
      } else {
        const $params = rule._params;
        if (!$params?.length) {
          return [null];
        } else {
          return $params;
        }
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
        return results.every((result) => !!result);
      }
    : (value: any | null | undefined, ...params: any[]) => {
        const $rules = computeRules(rules, value, ...params);
        return $rules.every((result) => !!result);
      };

  const newRule = createRule({
    type: 'and',
    validator: validator,
    message: '',
  });

  newRule._params = _params;

  return newRule as RegleRuleDefinition;
}

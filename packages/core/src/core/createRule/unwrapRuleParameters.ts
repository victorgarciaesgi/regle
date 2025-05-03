import { computed, isRef, toRef, toValue, unref, type MaybeRefOrGetter } from 'vue';

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwrapped value
 */
export function unwrapRuleParameters<TParams extends any[]>(params: MaybeRefOrGetter[]): TParams {
  try {
    return params.map((param) => toValue(param)) as TParams;
  } catch (e) {
    return [] as any;
  }
}

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwrapped value
 */
export function createReactiveParams<TParams extends any[]>(params: MaybeRefOrGetter[]): TParams {
  return params.map((param) => {
    if (param instanceof Function) {
      return computed(param);
    } else if (isRef(param)) {
      return param;
    }
    return toRef(() => param);
  }) as TParams;
}

/**
 * Due to `function.length` not returning default parameters, it needed to parse the func.toString()
 */
export function getFunctionParametersLength(func: Function): number {
  const funcStr = func.toString();

  const cleanStr = funcStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  const paramsMatch = cleanStr.match(
    /^(?:async\s*)?(?:function\b.*?\(|\((.*?)\)|(\w+))\s*=>|\((.*?)\)\s*=>|function.*?\((.*?)\)|\((.*?)\)/
  );

  if (!paramsMatch) return 0;

  const paramsSection = paramsMatch[0] || paramsMatch[1] || paramsMatch[2] || paramsMatch[3] || paramsMatch[4] || '';

  const paramList = paramsSection
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paramList.length;
}

import { isRef, toRef, unref } from 'vue';
import type { ParamDecl } from '../../types';

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwraped value
 */
export function unwrapRuleParameters<TParams extends any[]>(params: ParamDecl[]): TParams {
  try {
    return params.map((param) => {
      if (param instanceof Function) {
        try {
          const result = param();
          return result;
        } catch (e) {
          return null;
        }
      }
      return unref(param);
    }) as TParams;
  } catch (e) {
    return [] as any;
  }
}

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwraped value
 */
export function createReactiveParams<TParams extends any[]>(params: ParamDecl[]): TParams {
  return params.map((param) => {
    if (param instanceof Function) {
      return param;
    } else if (isRef(param)) {
      return param;
    }
    return toRef(() => param);
  }) as TParams;
}

/**
 * Due to `function.length` not returning default parameters, it need to parse the func.toString()
 */
export function getFunctionParametersLength(func: Function): number {
  const funcStr = func.toString();

  const cleanStr = funcStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  const paramsMatch = cleanStr.match(
    /^(?:async\s*)?(?:function\b.*?\(|\((.*?)\)|(\w+))\s*=>|\((.*?)\)\s*=>|function.*?\((.*?)\)|\((.*?)\)/
  );

  if (!paramsMatch) return 0;

  const paramsSection =
    paramsMatch[0] || paramsMatch[1] || paramsMatch[2] || paramsMatch[3] || paramsMatch[4] || '';

  const paramList = paramsSection
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paramList.length;
}

import { isRef, toRef, unref } from 'vue';
import { ParamDecl } from '../../types';

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwraped value
 */
export function unwrapRuleParameters<TParams extends any[]>(params: ParamDecl[]): TParams {
  return params.map((param) => {
    if (param instanceof Function) {
      return param();
    }
    return unref(param);
  }) as TParams;
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

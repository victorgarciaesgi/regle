import { unref } from 'vue';
import { ParamDecl } from '../../types';

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwraped value
 */
export function unwrapRuleParameters<TParams extends any[]>(params: ParamDecl[]): TParams {
  return params.map((param) => {
    if (typeof param === 'function') {
      return param();
    }
    return unref(param);
  }) as TParams;
}

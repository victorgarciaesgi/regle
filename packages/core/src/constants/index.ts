import type { InjectionKey } from 'vue';
import type { GlobalConfigOptions } from '../core/defineRegleConfig';

export const regleSymbol: InjectionKey<string> = Symbol('regle');
export const regleConfigSymbol: InjectionKey<GlobalConfigOptions<any, any> | undefined> = Symbol('regle-config');

export const REGLE_FLAGS = {
  REGLE_STATIC: '__regle_static',
} as const;

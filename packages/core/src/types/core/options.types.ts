import { RequiredDeep } from 'type-fest';
import { DeepMaybeRef } from '../../types/utils';
import { MaybeRef } from 'vue';
import { RegleExternalErrorTree } from '../../types/rules';

export interface RegleBehaviourOptions {
  /**
   * Only display error when calling `validateForm()`
   * @default false
   */
  lazy?: boolean;
  /**
   * Automaticaly set the dirty set without the need of `$value` or `$touch`
   * @default true
   */
  autoDirty?: boolean;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `validateForm()`
   * @default false
   *
   * @experimental report any bug
   */
  rewardEarly?: boolean;
}

export interface LocalRegleBehaviourOptions<TState extends Record<string, any>> {
  $externalErrors?: MaybeRef<RegleExternalErrorTree<TState>>;
}

export type FieldRegleBehaviourOptions = AddDollarToOptions<RegleBehaviourOptions> & {
  $debounce?: number;
};

export type ResolvedRegleBehaviourOptions = DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<Record<string, any>>;

export type AddDollarToOptions<T extends Record<string, any>> = {
  [K in keyof T as `$${string & K}`]: T[K];
};

export type FilterDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

export type PickDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? K : never]: T[K];
};

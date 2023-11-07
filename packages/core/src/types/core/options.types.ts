import { RequiredDeep } from 'type-fest';
import { DeepMaybeRef } from 'types/utils';
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
   */
  rewardEarly?: boolean;
}

export interface LocalRegleBehaviourOptions<TState extends Record<string, any>> {
  $externalErrors?: MaybeRef<RegleExternalErrorTree<TState>>;
}

export type ResolvedRegleBehaviourOptions = DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<Record<string, any>>;

import type { EmptyObject } from 'type-fest';
import type { ComputedRef, MaybeRef, Ref } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleExternalErrorTree,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import type { ExtractFromGetter } from '../utils';
import type { RegleValidationGroupEntry } from './options.types';

export interface Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TExternal extends RegleExternalErrorTree<TState> = never,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
> {
  regle: RegleStatus<TState, TRules, TValidationGroups>;
  r$: RegleStatus<TState, TRules, TValidationGroups>;
  /** Show active errors based on your behaviour options (lazy, autoDirty)
   * It allow you to skip scouting the `regle` object
   */
  errors: RegleErrorTree<TRules, TExternal>;
  ready: ComputedRef<boolean>;
  resetAll: () => void;
  validateState: () => Promise<false | DeepSafeFormState<TState, TRules>>;
  state: Ref<TState>;
}

export type DeepReactiveState<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type DeepSafeFormState<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree>,
> = [unknown] extends [TState]
  ? {}
  : {
      [K in keyof TState as [SafeProperty<TState[K], TRules[K]>] extends [never] ? K : never]?: [
        SafeProperty<TState[K], TRules[K]>,
      ] extends [never]
        ? TState[K]
        : SafeProperty<TState[K], TRules[K]>;
    } & {
      [K in keyof TState as [SafeProperty<TState[K], TRules[K]>] extends [never]
        ? never
        : K]-?: SafeProperty<TState[K], TRules[K]>;
    };

export type SafeProperty<
  TState,
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> =
  TRule extends RegleCollectionRuleDefinition<any, any>
    ? TState extends Array<any>
      ? SafeProperty<TState[number], ExtractFromGetter<TRule['$each']>>[]
      : never
    : TRule extends ReglePartialValidationTree<any, any>
      ? TState extends Record<string, any>
        ? DeepSafeFormState<TState, TRule>
        : TRule extends RegleRuleDecl<any, any>
          ? unknown extends TRule['required']
            ? never
            : TRule['required'] extends undefined
              ? never
              : TRule['required'] extends RegleRuleDefinition<any, infer Params, any, any, any>
                ? Params extends never[]
                  ? TState
                  : never
                : never
          : never
      : never;

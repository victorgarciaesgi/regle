import { Ref } from 'vue';
import {
  CustomRulesDeclarationTree,
  RegleCollectionErrors,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import { PartialDeep } from 'type-fest';

export interface Regle<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree>,
> {
  state: Ref<PartialDeep<TState>>;
  $regle: RegleStatus<TState, TRules>;
  errors: RegleErrorTree<TRules>;
  resetForm: () => void;
  validateForm: () => Promise<false | DeepSafeFormState<TState, TRules>>;
}

export type DeepSafeFormState<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree>,
> = {
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
> = TRule extends RegleCollectionRuleDefinition
  ? TState extends Array<any>
    ? SafeProperty<TState[number], TRule['$each']>[]
    : never
  : TRule extends ReglePartialValidationTree<any, any>
  ? TState extends Record<string, any>
    ? DeepSafeFormState<TState, TRule>
    : never
  : TRule extends RegleRuleDecl<any, any>
  ? unknown extends TRule['required']
    ? never
    : TRule['required'] extends undefined
    ? never
    : TRule['required'] extends RegleRuleDefinition<any, infer Params>
    ? Params extends never[]
      ? TState
      : never
    : never
  : never;

export type bar = DeepSafeFormState<
  {
    bar?: number | undefined;
    bloublou: {
      test: {
        name: string;
      }[];
    };
  },
  {
    bloublou: {
      test: {
        $each: {
          name: {
            required: RegleRuleDefinition<unknown, []>;
          };
        };
      };
    };
  }
>;

import type { DefaultValidators } from '../../core/defaultValidators';
import type { RegleRuleRawInput, RegleRuleWithParamsDefinition } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export type AllRulesDeclarations = CustomRulesDeclarationTree & {
  [K in keyof DefaultValidators]:
    | RegleRuleRawInput<
        any,
        DefaultValidators[K] extends RegleRuleWithParamsDefinition<any, infer Params extends any[], any, any>
          ? [...Params, ...any[]]
          : any[],
        boolean,
        any
      >
    | undefined;
};

import {
  InternalRuleType,
  type FormRuleDeclaration,
  type RegleRuleDefinitionProcessor,
  type RegleRuleDefinitionWithMetadataProcessor,
  type RegleRuleMetadataConsumer,
} from '@regle/core';
import { isRuleDef } from '../../utils/guards.utils';
import { diagnostics } from '../../diagnostics/rules';

export function extractValidator(rule: FormRuleDeclaration<any, any, any, any>) {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined = [];
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any[]>,
    string | string[]
  > = '';
  let _async: boolean = false;
  let _active:
    | boolean
    | RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, boolean>
    | undefined;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = InternalRuleType.Inline;
    validator = rule;
    _async = rule.constructor.name === 'AsyncFunction';
  } else if (isRuleDef(rule)) {
    ({ _type, validator, _message, _async, _params, _active } = rule);
  } else {
    throw diagnostics.REGLE_R0103();
  }

  return {
    _type,
    validator,
    _params,
    _message,
    _async,
    _active,
  };
}

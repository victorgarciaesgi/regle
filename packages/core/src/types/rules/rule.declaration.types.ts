import { ArrayElement, Maybe } from '../utils';
import { AllRulesDeclarations } from './rule.custom.types';
import {
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleRuleWithParamsDefinition,
} from './rule.definition.type';

/**
 * @public
 */
export type ReglePartialValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]?: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @internal
 * @reference {@link ReglePartialValidationTree}
 */
export type $InternalReglePartialValidationTree = {
  [x: string]: $InternalFormPropertyTypes;
};

/**
 * @public
 */
export type RegleFormPropertyType<
  TValue = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = [NonNullable<TValue>] extends [never]
  ? RegleRuleDecl<TValue, TCustomRules>
  : NonNullable<TValue> extends Array<any>
    ? RegleCollectionRuleDecl<TValue, TCustomRules>
    : NonNullable<TValue> extends Date
      ? RegleRuleDecl<NonNullable<TValue>, TCustomRules>
      : NonNullable<TValue> extends File
        ? RegleRuleDecl<NonNullable<TValue>, TCustomRules>
        : NonNullable<TValue> extends Record<string, any>
          ? ReglePartialValidationTree<NonNullable<TValue>, TCustomRules>
          : RegleRuleDecl<NonNullable<TValue>, TCustomRules>;

/**
 * @internal
 * @reference {@link RegleFormPropertyType}
 */
export type $InternalFormPropertyTypes =
  | $InternalRegleRuleDecl
  | $InternalRegleCollectionRuleDecl
  | $InternalReglePartialValidationTree;

/**
 * @public
 * Rule tree for a form property
 */
export type RegleRuleDecl<
  TValue extends any = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TCustomRules]?: TCustomRules[TKey] extends RegleRuleWithParamsDefinition<
    any,
    infer TParams
  >
    ? RegleRuleDefinition<TValue, TParams>
    : FormRuleDeclaration<TValue, any, any, any>;
};

/**
 * @internal
 * @reference {@link RegleRuleDecl}
 */
export type $InternalRegleRuleDecl = Record<string, FormRuleDeclaration<any, any, any, any>>;

/**
 * @public
 */
export type RegleCollectionRuleDecl<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each?: RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>;
    })
  | {
      $each?: RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>;
    };

/**
 * @internal
 * @reference {@link RegleCollectionRuleDecl}
 *
 */
export type $InternalRegleCollectionRuleDecl = $InternalRegleRuleDecl & {
  $each?: $InternalFormPropertyTypes;
};

/**
 * @public
 */
export type InlineRuleDeclaration<
  TValue extends any,
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
> = (value: Maybe<TValue>, ...args: any[]) => TReturn;

/**
 * @public
 * Regroup inline and registered rules
 * */
export type FormRuleDeclaration<
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
> =
  | InlineRuleDeclaration<TValue, TReturn, TMetadata, TAsync>
  | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;

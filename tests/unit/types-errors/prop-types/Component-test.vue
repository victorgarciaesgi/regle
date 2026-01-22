<template>
  <div> </div>
</template>

<script setup lang="ts">
  import type {
    CommonComparisonOptions,
    MaybeOutput,
    RegleCustomFieldStatus,
    RegleEnforceRequiredRules,
    RegleFieldStatus,
    InferRegleShortcuts,
    RegleRuleStatus,
  } from '@regle/core';
  import type { useCustomRegle } from './prop-types.config';

  const props = defineProps<{
    unknownField: RegleFieldStatus;
    unknownExplicitField: RegleFieldStatus<unknown>;
    booleanField: RegleFieldStatus<boolean | undefined>;
    stringField: RegleFieldStatus<string | undefined>;
    stringNumberField: RegleFieldStatus<string | undefined> | RegleFieldStatus<number | undefined>;
    shortcutsField?: RegleFieldStatus<string, any, InferRegleShortcuts<typeof useCustomRegle>>;
    customStringField: RegleCustomFieldStatus<typeof useCustomRegle, string>;
    enforcedRulesField: RegleFieldStatus<string | undefined, RegleEnforceRequiredRules<'required'>>;
    enforcedMultipleRulesField: RegleFieldStatus<
      string | undefined,
      RegleEnforceRequiredRules<'required' | 'minLength'>
    >;
    enforcedCustomRulesField: RegleCustomFieldStatus<typeof useCustomRegle, string | undefined, 'myCustomRule'>;
  }>();

  // -

  expectTypeOf(props.unknownField.$rules).toEqualTypeOf<{
    readonly [x: string]: RegleRuleStatus<any, any[], any>;
  }>();
  expectTypeOf(props.unknownField.$value).toEqualTypeOf<any>();

  // -

  expectTypeOf(props.unknownExplicitField.$rules).toEqualTypeOf<{
    readonly [x: string]: RegleRuleStatus<unknown, any[], any>;
  }>();
  expectTypeOf(props.unknownExplicitField.$value).toEqualTypeOf<unknown>();

  // -

  expectTypeOf(props.booleanField.$rules).toEqualTypeOf<{
    readonly [x: string]: RegleRuleStatus<boolean | undefined, any[], any>;
  }>();
  expectTypeOf(props.booleanField.$value).toEqualTypeOf<MaybeOutput<boolean | undefined>>();

  //-

  expectTypeOf(props.stringNumberField.$rules).toEqualTypeOf<
    | {
        readonly [x: string]: RegleRuleStatus<string | undefined, any[] | [], any>;
      }
    | {
        readonly [x: string]: RegleRuleStatus<number | undefined, any[] | [], any>;
      }
  >();
  expectTypeOf(props.stringNumberField.$value).toEqualTypeOf<MaybeOutput<string | number>>();

  //-
  expectTypeOf(props.customStringField.$test).toEqualTypeOf<boolean>();
  expectTypeOf(props.customStringField.$isRequired).toEqualTypeOf<boolean>();

  expectTypeOf(props.customStringField.$rules.myCustomRule).toEqualTypeOf<
    RegleRuleStatus<string, [], boolean> | undefined
  >();

  //-
  expectTypeOf(props.enforcedRulesField.$rules.required).toEqualTypeOf<
    RegleRuleStatus<string | undefined, [], boolean>
  >();

  //-

  expectTypeOf(props.shortcutsField?.$test).toEqualTypeOf<boolean | undefined>();

  //-
  expectTypeOf(props.enforcedMultipleRulesField.$rules.minLength).toEqualTypeOf<
    RegleRuleStatus<string | undefined, [count: number, options?: CommonComparisonOptions | undefined], boolean>
  >();
  expectTypeOf(props.enforcedMultipleRulesField.$rules.minLength.$params).toEqualTypeOf<
    [count: number, options?: CommonComparisonOptions | undefined]
  >();

  //-
  expectTypeOf(props.enforcedCustomRulesField.$rules.myCustomRule).toEqualTypeOf<
    RegleRuleStatus<string | undefined, [], boolean>
  >();

  //-
  expectTypeOf(props.enforcedCustomRulesField.$test).toEqualTypeOf<boolean>();
</script>

<style lang="scss" scoped></style>

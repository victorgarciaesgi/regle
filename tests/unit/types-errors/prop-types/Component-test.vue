<template>
  <div> </div>
</template>

<script setup lang="ts">
import type {
  CommonComparationOptions,
  InferRegleShortcuts,
  Maybe,
  RegleEnforceCustomRequiredRules,
  RegleEnforceRequiredRules,
  RegleFieldStatus,
  RegleRuleMetadataDefinition,
  RegleRuleStatus,
} from '@regle/core';
import type { useCustomRegle } from './prop-types.config';

type MyShortcuts = InferRegleShortcuts<typeof useCustomRegle>;

const props = defineProps<{
  unknownField: RegleFieldStatus;
  booleanField: RegleFieldStatus<boolean | undefined>;
  stringField: RegleFieldStatus<string | undefined>;
  stringNumberField: RegleFieldStatus<string | undefined> | RegleFieldStatus<number | undefined>;
  customStringField: RegleFieldStatus<string | undefined, any, MyShortcuts>;
  enforcedRulesField: RegleFieldStatus<string | undefined, RegleEnforceRequiredRules<'required'>>;
  enforcedMultipleRulesField: RegleFieldStatus<string | undefined, RegleEnforceRequiredRules<'required' | 'minLength'>>;
  enforcedCustomRulesField: RegleFieldStatus<
    string | undefined,
    RegleEnforceCustomRequiredRules<typeof useCustomRegle, 'myCustomRule'>,
    MyShortcuts
  >;
}>();

// -

expectTypeOf(props.unknownField.$rules).toEqualTypeOf<{
  readonly [x: string]: RegleRuleStatus<any, any[] | [], any>;
}>();
expectTypeOf(props.unknownField.$value).toEqualTypeOf<any>();

// -

expectTypeOf(props.booleanField.$rules).toEqualTypeOf<{
  readonly [x: string]: RegleRuleStatus<boolean | undefined, any[] | [], any>;
}>();
expectTypeOf(props.booleanField.$value).toEqualTypeOf<Maybe<boolean | undefined>>();

//-

expectTypeOf(props.stringNumberField.$rules).toEqualTypeOf<
  | {
      readonly [x: string]: RegleRuleStatus<string | undefined, any[] | [], any>;
    }
  | {
      readonly [x: string]: RegleRuleStatus<number | undefined, any[] | [], any>;
    }
>();
expectTypeOf(props.stringNumberField.$value).toEqualTypeOf<Maybe<string | number>>();

//-
expectTypeOf(props.customStringField.$test).toEqualTypeOf<boolean>();

//-
expectTypeOf(props.enforcedRulesField.$rules.required).toEqualTypeOf<
  RegleRuleStatus<string | undefined, [], RegleRuleMetadataDefinition>
>();

//-
expectTypeOf(props.enforcedMultipleRulesField.$rules.minLength).toEqualTypeOf<
  RegleRuleStatus<string | undefined, [count: number, options?: CommonComparationOptions | undefined], boolean>
>();
expectTypeOf(props.enforcedMultipleRulesField.$rules.minLength.$params).toEqualTypeOf<
  [count: number, options?: CommonComparationOptions | undefined]
>();

//-
expectTypeOf(props.enforcedCustomRulesField.$rules.myCustomRule).toEqualTypeOf<
  RegleRuleStatus<string | undefined, []>
>();
</script>

<style lang="scss" scoped></style>

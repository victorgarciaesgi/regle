import type { ReglePartialRuleTree } from '@regle/core';
import { required } from '@regle/rules';
import type * as v from 'valibot';
import { effectScope, onScopeDispose, ref, toRef, watch, type Ref } from 'vue';
import { isObject } from '../../../../../../shared';
import type { MaybeSchemaAsync } from '../../../../types/valibot/valibot.schema.types';
import { isObjectSchema } from '../guards';
import { processValibotTypeDef } from '../processValibotTypeDef';
import { getNestedValibotObjectSchema } from './valibotObjectToRegle';

function isLiteralSchema(schema?: MaybeSchemaAsync<unknown>): schema is v.LiteralSchema<any, any> {
  return schema?.type === 'literal';
}

export function valibotVariantToRegle(
  schema: v.VariantSchema<any, v.VariantOptions<any>, any>,
  state: Ref<unknown>
): { valibotRule: Ref<ReglePartialRuleTree<any, any>> } {
  const scope = effectScope();

  const scopeState = scope.run(() => {
    const valibotRule = ref<ReglePartialRuleTree<any, any>>({});

    watch(
      state,
      () => {
        if (isObject(state.value) && state.value[schema.key]) {
          const selectedDiscriminant = schema.options.find((o) => {
            const nestedSchema = getNestedValibotObjectSchema(o);
            const schemaVariantKey = nestedSchema?.entries[schema.key];
            if (isLiteralSchema(schemaVariantKey) && isObject(state.value)) {
              return schemaVariantKey.literal === state.value[schema.key];
            }
            return false;
          });
          if (selectedDiscriminant && isObjectSchema(selectedDiscriminant)) {
            valibotRule.value = Object.fromEntries(
              Object.entries(selectedDiscriminant.entries).map(([key, shape]) => {
                return [key, processValibotTypeDef(shape, toRef(isObject(state.value) ? state.value : {}, key))];
              })
            );
          } else {
            valibotRule.value = {};
          }
        } else {
          valibotRule.value = {
            [schema.key]: { required },
          };
        }
      },
      { deep: true, flush: 'pre', immediate: true }
    );

    onScopeDispose(() => {
      scope.stop();
    });

    return { valibotRule };
  })!;

  return scopeState;
}

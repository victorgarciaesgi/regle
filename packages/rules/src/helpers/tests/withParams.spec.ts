import { inferRules, InternalRuleType, RegleVuePlugin, createRule, useRegle, type Maybe } from '@regle/core';
import { mount } from '@vue/test-utils';
import { computed, defineComponent, ref } from 'vue';
import { withParams } from '../withParams';
import { applyIf } from '../applyIf';
import { required } from '../../rules';
import { withMessage } from '../withMessage';

describe('withParams helper', () => {
  const testComponent = defineComponent({
    setup() {
      const condition = ref(true);
      const deepNestedCondition = ref({
        a: {
          b: {
            c: {
              d: {
                e: {
                  condition: true,
                },
              },
            },
          },
        },
      });

      const form = ref({
        one: '',
        two: '',
      });

      const computedTwoRules = computed(() => {
        return inferRules(form.value.two, {
          required: withParams(
            withMessage(
              applyIf(() => {
                return deepNestedCondition.value.a.b.c.d.e.condition;
              }, required),
              'Error'
            ),
            [() => deepNestedCondition.value.a.b.c.d.e.condition]
          ),
        });
      });

      return {
        condition,
        deepNestedCondition,
        ...useRegle(form, () => ({
          one: {
            required: withParams(
              (value, condition) => {
                if (condition) {
                  return !!value;
                }
                return true;
              },
              [condition]
            ),
          },
          two: computedTwoRules.value,
        })),
      };
    },
    template: '<div></div>',
  });

  const { vm } = mount(testComponent, {
    global: {
      plugins: [RegleVuePlugin],
    },
  });

  it('should register reactive params as dependencies', async () => {
    expect(vm.r$.one.$invalid).toBe(true);
    expect(vm.r$.one.$invalid).toBe(true);

    vm.condition = false;
    await vm.$nextTick();

    expect(vm.r$.one.$invalid).toBe(false);
    expect(vm.r$.one.$invalid).toBe(false);

    vm.condition = true;
    await vm.$nextTick();

    vm.r$.$value.one = 'foo';
    await vm.$nextTick();

    expect(vm.r$.one.$invalid).toBe(false);
    expect(vm.r$.one.$invalid).toBe(false);

    // with applyIf
    expect(vm.r$.two.$invalid).toBe(true);
    expect(vm.r$.two.$invalid).toBe(true);

    vm.deepNestedCondition.a.b.c.d.e.condition = false;
    await vm.$nextTick();

    expect(vm.r$.two.$invalid).toBe(false);
    expect(vm.r$.two.$invalid).toBe(false);
  });

  it('should correctly infer types', () => {
    useRegle(
      { name: '' },
      {
        name: {
          required: withParams(
            (value: Maybe<string>, foo) => {
              expectTypeOf(value).toEqualTypeOf<Maybe<string>>();
              expectTypeOf(foo).toEqualTypeOf<number>();
              return true;
            },
            [() => 0]
          ),
          foo: withMessage(
            withParams(
              (value: Maybe<string>, foo) => {
                expectTypeOf(value).toEqualTypeOf<Maybe<string>>();
                expectTypeOf(foo).toEqualTypeOf<number>();
                return true;
              },
              [() => 0]
            ),
            ({ $params, $value }) => {
              expectTypeOf($params).toEqualTypeOf<[number]>();
              expectTypeOf($params[0]).toEqualTypeOf<number>();
              expectTypeOf($value).toEqualTypeOf<Maybe<string>>();
              return '';
            }
          ),
          bar: withMessage(() => true, ''),
        },
      }
    );

    withMessage(
      withParams((_value, _param) => ({ $valid: true, foo: 'bar' }), [() => 0]),
      ({ foo, $params }) => {
        expectTypeOf(foo).toEqualTypeOf<string>();
        expectTypeOf($params).toEqualTypeOf<[number]>();
        return '';
      }
    );
  });

  it('should fallback to inline type and empty params for rule defs', () => {
    const customRule = createRule({
      type: 'custom',
      validator(value: unknown, min: number) {
        return Number(value) >= min;
      },
      message: 'Error',
    });

    customRule._type = undefined as any;
    customRule._params = undefined as any;

    const wrappedRule = withParams(customRule as any, []);

    expect(wrappedRule.type).toBe(InternalRuleType.Inline);
    expect(wrappedRule.exec(2)).toBe(false);
  });
});

import { inferRules, useRegle, type Maybe } from '@regle/core';
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

  const { vm } = mount(testComponent);

  it('should register reactive params as dependencies', async () => {
    expect(vm.r$.$fields.one.$invalid).toBe(true);

    vm.condition = false;
    await vm.$nextTick();

    expect(vm.r$.$fields.one.$invalid).toBe(false);

    vm.condition = true;
    await vm.$nextTick();

    vm.r$.$value.one = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$fields.one.$invalid).toBe(false);

    // with applyIf
    expect(vm.r$.$fields.two.$invalid).toBe(true);

    vm.deepNestedCondition.a.b.c.d.e.condition = false;
    await vm.$nextTick();

    expect(vm.r$.$fields.two.$invalid).toBe(false);
  });

  it('should correctly infer types', () => {
    useRegle(
      { name: '' },
      {
        name: {
          required: withParams(
            (value, foo) => {
              expectTypeOf(value).toEqualTypeOf<Maybe<string>>();
              expectTypeOf(foo).toEqualTypeOf<number>();
              return true;
            },
            [() => 0]
          ),
          foo: withMessage(
            withParams(
              (value, foo) => {
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
          bar: withMessage((value) => true, ''),
        },
      }
    );

    withMessage(
      withParams((value, param) => ({ $valid: true, foo: 'bar' }), [() => 0]),
      ({ foo, $params }) => {
        expectTypeOf(foo).toEqualTypeOf<string>();
        expectTypeOf($params).toEqualTypeOf<[number]>();
        return '';
      }
    );
  });
});

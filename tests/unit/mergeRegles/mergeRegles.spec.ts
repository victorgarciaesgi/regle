import { mergeRegles, RegleVuePlugin, useRegle } from '@regle/core';
import { numeric, required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { ruleMockIsEven } from '../../fixtures';

function createMultipleRegleInstances() {
  return defineComponent({
    setup() {
      const data = ref({
        competency: 'c1',
        level: { id: 1 },
      });

      const data2 = ref({
        name: '',
        level: { count: 1 },
      });

      const data3 = ref({
        firstName: '',
        collection: [{ name: '' }],
      });

      const { r$: firstR$ } = useRegle(data, {
        competency: { required },
        level: {
          id: { required, ruleMockIsEven },
        },
      });

      const { r$: secondR$ } = useRegle(data2, {
        name: { required },
        level: {
          count: { numeric: numeric, ruleMockIsEven },
        },
      });

      const { r$: thirdR$ } = useRegle(data3, {
        firstName: { required },
        collection: {
          $each: {
            name: { required },
          },
        },
      });

      const r$Merged = mergeRegles({ firstR$, secondR$, thirdR$ });

      return { firstR$, secondR$, thirdR$, r$Merged };
    },
    template: '<div></div>',
  });
}

describe('mergeRegles', () => {
  const { vm } = mount(createMultipleRegleInstances(), {
    global: {
      plugins: [RegleVuePlugin],
    },
  });

  it('should merge properties', async () => {
    expect(vm.r$Merged.$invalid).toBe(true);
    expect(vm.r$Merged.$dirty).toBe(false);
    expect(vm.r$Merged.$anyDirty).toBe(false);
    expect(vm.r$Merged.$edited).toBe(false);
    expect(vm.r$Merged.$anyEdited).toBe(false);
    expect(vm.r$Merged.$ready).toBe(false);

    expect(vm.r$Merged.$value).toStrictEqual({
      firstR$: {
        competency: 'c1',
        level: { id: 1 },
      },
      secondR$: {
        name: '',
        level: { count: 1 },
      },
      thirdR$: {
        firstName: '',
        collection: [{ name: '' }],
      },
    });

    expect(vm.r$Merged.$issues).toStrictEqual({
      firstR$: {
        competency: [],
        level: {
          id: [],
        },
      },
      secondR$: {
        level: {
          count: [],
        },
        name: [],
      },
      thirdR$: {
        collection: {
          $each: [
            {
              name: [],
            },
          ],
          $self: [],
        },
        firstName: [],
      },
    });
    expect(vm.r$Merged.$errors.firstR$).toStrictEqual({
      competency: [],
      level: {
        id: [],
      },
    });
    expect(vm.r$Merged.$errors.secondR$).toStrictEqual({
      name: [],
      level: {
        count: [],
      },
    });

    expect(vm.r$Merged.$errors.thirdR$).toStrictEqual({
      firstName: [],
      collection: {
        $self: [],
        $each: [{ name: [] }],
      },
    });

    vm.firstR$.$value.competency = '';
    await vm.$nextTick();

    expect(vm.r$Merged.$errors.firstR$).toStrictEqual({
      competency: ['This field is required'],
      level: {
        id: [],
      },
    });

    vm.r$Merged.$touch();
    await vm.$nextTick();

    expect(vm.r$Merged.$dirty).toBe(true);

    const { data, valid } = await vm.r$Merged.$validate();

    expect(valid).toBe(false);
    expect(data).toStrictEqual({
      firstR$: {
        competency: '',
        level: { id: 1 },
      },
      secondR$: {
        name: '',
        level: { count: 1 },
      },
      thirdR$: {
        firstName: '',
        collection: [{ name: '' }],
      },
    });

    vm.r$Merged.$reset();

    expect(vm.r$Merged.$dirty).toBe(false);

    const dirtyFields = vm.r$Merged.$extractDirtyFields();

    expectTypeOf(dirtyFields).toBeArray();
    expectTypeOf(dirtyFields[0].firstR$?.competency).toEqualTypeOf<string | undefined>();
    expectTypeOf(dirtyFields[1]).toBeObject();
    expectTypeOf(dirtyFields[2]).toBeObject();
    expect(vm.r$Merged.$extractDirtyFields()).toStrictEqual([{}, {}, {}]);
  });
});

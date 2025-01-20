import { mergeRegles, useRegle } from '@regle/core';
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
  const { vm } = mount(createMultipleRegleInstances());

  it('should merge properties', () => {
    expect(vm.r$Merged.$invalid).toBe(true);
    expect(vm.r$Merged.$dirty).toBe(false);
    expect(vm.r$Merged.$anyDirty).toBe(false);
    expect(vm.r$Merged.$edited).toBe(false);
    expect(vm.r$Merged.$anyEdited).toBe(false);
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
  });
});

import { useRegle, type RegleExternalErrorTree } from '@regle/core';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeUnRuledField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

describe('external errors', () => {
  function nestedExternalErrorsOnly() {
    interface Form {
      root: string;
      nested: { name1: { name2: string } };
      collection: {
        item: string;
      }[];
    }

    const form = ref<Form>({
      root: '',
      nested: { name1: { name2: '' } },
      collection: [{ item: '' }, { item: '' }],
    });

    const externalErrors = ref<RegleExternalErrorTree<Form>>({});

    return { externalErrors, ...useRegle(form, {}, { externalErrors }) };
  }

  it('should behave correctly when no client rule is present', async () => {
    const { vm } = createRegleComponent(nestedExternalErrorsOnly);

    shouldBeUnRuledField(vm.r$.$fields.root);
    shouldBeUnRuledField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeUnRuledField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$valid).toBe(true);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$valid).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([
      'Server Error',
    ]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);
  });
});

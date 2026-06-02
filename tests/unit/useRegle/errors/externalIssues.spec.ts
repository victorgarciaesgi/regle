import {
  inferRules,
  useRegle,
  type RegleExternalErrorTree,
  type RegleExternalFieldIssue,
  type RegleExternalIssueTree,
  type RegleFieldIssue,
} from '@regle/core';
import { required } from '@regle/rules';
import { computed, nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeUnRuledCorrectField } from '../../../utils/validations.utils';

function issue(message: string, property: string, code: string): RegleExternalFieldIssue & { code: string } {
  return {
    $message: message,
    $property: property,
    code,
  };
}

describe('external issues', () => {
  function nestedExternalIssuesWithRules() {
    interface Form {
      root: string;
      nested: { name1: { name2: string } };
      collection: {
        item: string;
      }[];
    }

    const form = ref<Form>({
      root: 'foo',
      nested: { name1: { name2: 'foo' } },
      collection: [{ item: 'foo' }, { item: 'foo' }],
    });

    const externalErrors = ref<RegleExternalErrorTree<Form> | Record<string, string[]>>({});
    const externalIssues = ref<RegleExternalIssueTree<Form> | Record<string, RegleFieldIssue[]>>({});

    const rules = computed(() => {
      return inferRules(form, {
        root: { required },
        nested: { name1: { name2: { required } } },
        collection: {
          $each: {
            item: { required },
          },
        },
      });
    });

    return {
      externalErrors,
      externalIssues,
      ...useRegle(form, rules, { externalErrors, externalIssues, clearExternalErrorsOnChange: false }),
    };
  }

  it('should preserve issue metadata and derive errors from messages', async () => {
    const { vm } = createRegleComponent(nestedExternalIssuesWithRules);

    vm.r$.$touch();
    vm.externalIssues = {
      root: [issue('Server Root', 'root', 'ROOT')],
      nested: { name1: { name2: [issue('Server Nested', 'name2', 'NESTED')] } },
      collection: {
        $self: [issue('Server Collection', '$self', 'COLLECTION')],
        $each: [{}, { item: [issue('Server Item', 'item', 'ITEM')] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$self);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Root']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Nested']);
    expect(vm.r$.collection.$self.$errors).toStrictEqual(['Server Collection']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Item']);

    expect(vm.r$.root.$issues).toStrictEqual([{ ...issue('Server Root', 'root', 'ROOT'), $rule: 'external' }]);
    expect(vm.r$.nested.name1.name2.$issues).toStrictEqual([
      { ...issue('Server Nested', 'name2', 'NESTED'), $rule: 'external' },
    ]);
    expect(vm.r$.collection.$each[1].item.$issues).toStrictEqual([
      { ...issue('Server Item', 'item', 'ITEM'), $rule: 'external' },
    ]);

    const { valid } = await vm.r$.$validate();
    expect(valid).toBe(true);
  });

  it('should make external errors and external issues mutually exclusive', async () => {
    const { vm } = createRegleComponent(nestedExternalIssuesWithRules);

    vm.r$.$touch();
    vm.externalIssues = {
      root: [issue('Server Root', 'root', 'ROOT')],
    };

    await vm.$nextTick();

    expect(vm.r$.root.$errors).toStrictEqual(['Server Root']);
    expect(vm.r$.root.$externalErrors ?? []).toStrictEqual([]);

    vm.externalErrors = {
      root: ['Server Error'],
    };

    await vm.$nextTick();

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.root.$externalIssues ?? []).toStrictEqual([]);

    vm.r$.$setExternalIssues({
      root: [issue('Server Root 2', 'root', 'ROOT_2')],
    });

    await vm.$nextTick();

    expect(vm.externalErrors).toStrictEqual({});
    expect(vm.r$.root.$errors).toStrictEqual(['Server Root 2']);
    expect(vm.r$.root.$externalErrors ?? []).toStrictEqual([]);
  });

  it('should support dot-path external issues without declared rules', async () => {
    const form = ref({
      nested: {
        name: '',
      },
    });
    const { r$ } = useRegle(form, {});

    r$.$touch();
    r$.$setExternalIssues({
      'nested.name': [issue('Server Name', 'name', 'NAME')],
    });

    await nextTick();

    shouldBeErrorField(r$.nested.name);
    expect(r$.nested.name.$errors).toStrictEqual(['Server Name']);
    expect(r$.nested.name.$issues).toStrictEqual([{ ...issue('Server Name', 'name', 'NAME'), $rule: 'external' }]);

    form.value.nested.name = 'foo';
    await nextTick();

    shouldBeUnRuledCorrectField(r$.nested.name);
    expect(r$.nested.name.$errors).toStrictEqual([]);
  });

  it('should support single-field external issues', async () => {
    const externalIssues = ref<RegleExternalFieldIssue[]>([]);
    const { r$ } = useRegle(ref('foo'), { required }, { externalIssues: externalIssues });

    r$.$touch();
    externalIssues.value = [issue('Server Field', 'root', 'FIELD')];

    await nextTick();

    expect(r$.$errors).toStrictEqual(['Server Field']);
    expect(r$.$issues).toStrictEqual([{ ...issue('Server Field', 'root', 'FIELD'), $rule: 'external' }]);

    r$.$clearExternalIssues();

    await nextTick();

    expect(r$.$errors).toStrictEqual([]);
    expect(externalIssues.value).toStrictEqual([]);
  });

  it('should clear external issues on validate and reset', async () => {
    const externalIssues = ref<RegleExternalFieldIssue[]>([issue('Server Field', 'root', 'FIELD')]);
    const { r$ } = useRegle(ref('foo'), { required }, { externalIssues, clearExternalErrorsOnValidate: true });

    r$.$touch();
    await nextTick();

    expect(r$.$errors).toStrictEqual(['Server Field']);

    await r$.$validate();

    expect(r$.$errors).toStrictEqual([]);
    expect(externalIssues.value).toStrictEqual([]);

    externalIssues.value = [issue('Server Field', 'root', 'FIELD')];

    await nextTick();

    r$.$reset({ clearExternalErrors: true });
    await nextTick();

    expect(r$.$errors).toStrictEqual([]);
    expect(externalIssues.value).toStrictEqual([]);
  });
});

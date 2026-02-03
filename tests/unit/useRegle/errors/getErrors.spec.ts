import {
  getErrors,
  getIssues,
  useRegle,
  type CommonComparisonOptions,
  type MaybeInput,
  type RegleFieldIssue,
  type RegleRuleDefinition,
} from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import { ref, toRef } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { useRegleSchema } from '@regle/schemas';
import z from 'zod';

function getErrorsRules() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      nested: {
        child: '',
        collection: [{ name: '' }],
      },
    },
    contacts: [{ name: '' }],
  });

  return useRegle(form, {
    email: { required, email, minLength: minLength(5) },
    user: {
      firstName: { required },
      nested: {
        child: { required },
        collection: {
          required,
          $each: {
            name: { required },
          },
        },
      },
    },
    contacts: {
      $each: {
        name: { required },
      },
    },
  });
}

describe('getErrors', () => {
  it('should return undefined for pristine form', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    const emailErrors = getErrors(vm.r$, 'email');
    expect(emailErrors).toStrictEqual([]);
  });

  it('should return errors for a simple field path', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const emailErrors = getErrors(vm.r$, 'email');
    expectTypeOf(emailErrors).toEqualTypeOf<string[]>();

    expect(emailErrors).toStrictEqual(['This field is required']);
  });

  it('should return errors for nested field paths', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const firstNameErrors = getErrors(vm.r$, 'user');
    // @ts-expect-error - The property is not an error field
    expectTypeOf(firstNameErrors).toEqualTypeOf<string[]>();

    const childErrors = getErrors(vm.r$, 'user.nested.child');
    expectTypeOf(childErrors).toEqualTypeOf<string[]>();

    expect(childErrors).toStrictEqual(['This field is required']);
  });

  it('should return errors for collection items', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const contactNameErrors = getErrors(vm.r$, 'contacts.$each.0.name');
    expectTypeOf(contactNameErrors).toEqualTypeOf<string[] | undefined>();
    expect(contactNameErrors).toStrictEqual(['This field is required']);

    const collectionNameErrors = getErrors(vm.r$, 'user.nested.collection.$each.0.name');
    expect(collectionNameErrors).toStrictEqual(['This field is required']);
  });

  it('should return multiple errors when multiple rules fail', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.email = 'foo';
    await vm.$nextTick();
    await vm.r$.$validate();

    const emailErrors = getErrors(vm.r$, 'email');
    expect(emailErrors).toStrictEqual([
      'The value must be a valid email address',
      'The value must be at least 5 characters long',
    ]);
  });

  it('should return empty array when field is valid', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.email = 'test@example.com';
    await vm.$nextTick();
    await vm.r$.$validate();

    const emailErrors = getErrors(vm.r$, 'email');
    expect(emailErrors).toStrictEqual([]);
  });

  it('should work with dynamically added collection items', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    await vm.r$.$validate();

    const contact0Errors = getErrors(vm.r$, 'contacts.$each.0.name');
    const contact1Errors = getErrors(vm.r$, 'contacts.$each.1.name');

    expect(contact0Errors).toStrictEqual(['This field is required']);
    expect(contact1Errors).toStrictEqual(['This field is required']);
  });
});

describe('getIssues', () => {
  it('should return empty array for pristine form', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    const emailIssues = getIssues(vm.r$, 'email');
    expect(emailIssues).toStrictEqual([]);
  });

  it('should return issues with metadata for a simple field path', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const emailIssues = getIssues(vm.r$, 'email');
    expectTypeOf(emailIssues).toEqualTypeOf<
      RegleFieldIssue<{
        required: RegleRuleDefinition<'required', unknown, [], false, boolean, unknown, unknown, true>;
        email: RegleRuleDefinition<'email', string, [], false, boolean, MaybeInput<string>, string, boolean>;
        minLength: RegleRuleDefinition<
          'minLength',
          string | any[] | Record<PropertyKey, any>,
          [min: number, options?: CommonComparisonOptions | undefined],
          false,
          boolean,
          unknown,
          string | any[] | Record<PropertyKey, any>,
          boolean
        >;
      }>[]
    >();

    expect(emailIssues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'email',
        $rule: 'required',
        $type: 'required',
      },
    ]);
  });

  it('should return issues for nested field paths', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const firstNameIssues = getIssues(vm.r$.user, 'firstName');
    expect(firstNameIssues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'firstName',
        $rule: 'required',
        $type: 'required',
      },
    ]);

    const childIssues = getIssues(vm.r$, 'user.nested.child');
    expect(childIssues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'child',
        $rule: 'required',
        $type: 'required',
      },
    ]);
  });

  it('should return issues for collection items', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    await vm.r$.$validate();

    const contactNameIssues = getIssues(vm.r$, 'contacts.$each.0.name');
    expect(contactNameIssues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'name',
        $rule: 'required',
        $type: 'required',
      },
    ]);
  });

  it('should return multiple issues when multiple rules fail', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.email = 'foo';
    await vm.$nextTick();
    await vm.r$.$validate();

    const emailIssues = getIssues(vm.r$, 'email');
    expect(emailIssues).toHaveLength(2);
    expect(emailIssues).toStrictEqual([
      {
        $message: 'The value must be a valid email address',
        $property: 'email',
        $rule: 'email',
        $type: 'email',
      },
      {
        $message: 'The value must be at least 5 characters long',
        $property: 'email',
        $rule: 'minLength',
        $type: 'minLength',
      },
    ]);
  });

  it('should return empty array when field is valid', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.email = 'test@example.com';
    await vm.$nextTick();
    await vm.r$.$validate();

    const emailIssues = getIssues(vm.r$, 'email');
    expect(emailIssues).toStrictEqual([]);
  });

  it('should work with dynamically added collection items', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    await vm.r$.$validate();

    const contact0Issues = getIssues(vm.r$, 'contacts.$each.0.name');
    const contact1Issues = getIssues(vm.r$, 'contacts.$each.1.name');

    expect(contact0Issues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'name',
        $rule: 'required',
        $type: 'required',
      },
    ]);
    expect(contact1Issues).toStrictEqual([
      {
        $message: 'This field is required',
        $property: 'name',
        $rule: 'required',
        $type: 'required',
      },
    ]);
  });

  it('should support non-literal paths', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    const path = 'email' as string;

    const emailIssues = getErrors(vm.r$, path);
    expect(emailIssues).toStrictEqual([]);
  });

  it('should support Refs', () => {
    const { vm } = createRegleComponent(getErrorsRules);

    const r$ = toRef(vm.r$);

    const emailIssues = getErrors(r$, 'email');
    const emailIssues2 = getIssues(r$, 'email');
    expectTypeOf(emailIssues).toEqualTypeOf<string[]>();
    expectTypeOf(emailIssues2).toExtend<RegleFieldIssue[]>();
  });

  it('should support schema refs', () => {
    const { r$ } = useRegleSchema({ name: '' }, z.object({ name: z.string() }));

    const nameIssues = getErrors(r$, 'name');
    const nameIssues2 = getIssues(r$, 'name');
    expectTypeOf(nameIssues).toEqualTypeOf<string[]>();
    expectTypeOf(nameIssues2).toEqualTypeOf<RegleFieldIssue<any>[]>();
  });

  it('should support non-literal paths', async () => {
    const { vm } = createRegleComponent(getErrorsRules);

    const path = 'email' as string;

    const emailIssues = getIssues(vm.r$, path);
    expect(emailIssues).toStrictEqual([]);
  });
});

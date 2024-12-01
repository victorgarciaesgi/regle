import type { RegleCollectionStatus, RegleFieldStatus, RegleStatus } from '@regle/core';
import { isEmpty } from '../../packages/core/src/utils';

export function shouldBePristineField(
  field?: RegleStatus<any, any> | RegleFieldStatus<any, any> | RegleCollectionStatus<any, any, any>
) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$errors).toStrictEqual([]);
  }
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeInvalidField(
  field?: RegleStatus<any, any> | RegleFieldStatus<any, any> | RegleCollectionStatus<any, any, any>
) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$anyDirty).toBe(false);
  }
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeErrorField(
  field?: RegleStatus<any, any> | RegleFieldStatus<any, any> | RegleCollectionStatus<any, any, any>
) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(true);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeValidField(
  field?:
    | RegleStatus<any, any>
    | RegleFieldStatus<any, any, any>
    | RegleCollectionStatus<any, any, any, any>
) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(true);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$errors).toStrictEqual([]);
  }
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeCorrectNestedStatus(field?: RegleStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeUnRuledPristineField(field?: RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$errors).toStrictEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeUnRuledCorrectField(field?: RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$errors).toStrictEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

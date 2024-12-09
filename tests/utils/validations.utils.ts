import type { RegleCollectionStatus, RegleFieldStatus, RegleStatus } from '@regle/core';
import type { ZodRegleCollectionStatus, ZodRegleFieldStatus, ZodRegleStatus } from '@regle/zod';

type PossibleFields =
  | RegleStatus<any, any>
  | RegleFieldStatus<any, any>
  | RegleCollectionStatus<any, any, any>
  | ZodRegleStatus<any, any>
  | ZodRegleFieldStatus<any, any>
  | ZodRegleCollectionStatus<any, any>;

export function shouldBePristineField(field?: PossibleFields) {
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

export function shouldBeInvalidField(field?: PossibleFields) {
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

export function shouldBeErrorField(field?: PossibleFields) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(true);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$dirty).toBe(true);
  }
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeValidField(field?: PossibleFields) {
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

export function shouldBeCorrectNestedStatus(field?: RegleStatus<any, any> | ZodRegleStatus) {
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

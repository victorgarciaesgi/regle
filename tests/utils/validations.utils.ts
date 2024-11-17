import type { RegleFieldStatus } from '@regle/core';

export function shouldBeInvalidField(field?: RegleFieldStatus<any, any, any>) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeErrorField(field?: RegleFieldStatus<any, any, any>) {
  expect(field?.$invalid).toBe(true);
  expect(field?.$error).toBe(true);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$pending).toBe(false);
  expect(field?.$valid).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

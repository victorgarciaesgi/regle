import type {
  RegleFieldStatus,
  RegleStatus,
  SuperCompatibleRegleCollectionStatus,
  SuperCompatibleRegleFieldStatus,
  SuperCompatibleRegleStatus,
} from '@regle/core';
import type { RegleSchemaFieldStatus, RegleSchemaStatus } from '@regle/schemas';

type PossibleFields =
  | SuperCompatibleRegleStatus
  | SuperCompatibleRegleFieldStatus
  | SuperCompatibleRegleCollectionStatus;

export function shouldBePristineField(field?: PossibleFields) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$correct).toBe(false);
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
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$ready).toBe(false);
  expect(field?.$correct).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeErrorField(field?: PossibleFields) {
  expect(field?.$invalid).toBe(true);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$dirty).toBe(true);
  }
  expect(field?.$error).toBe(true);
  expect(field?.$ready).toBe(false);
  expect(field?.$anyDirty).toBe(true);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$correct).toBe(false);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeValidField(field?: PossibleFields) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$ready).toBe(true);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$correct).toBe(true);
  if (field && !('$fields' in field) && !('$each' in field)) {
    expect(field?.$errors).toStrictEqual([]);
  }
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeCorrectNestedStatus(field?: RegleStatus<{}, any, any> | RegleSchemaStatus<any, any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(true);
  expect(field?.$anyDirty).toBe(true);
  expect(field?.$ready).toBe(true);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$correct).toBe(true);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeUnRuledPristineField(field?: RegleFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$dirty).toBe(false);
  expect(field?.$anyDirty).toBe(false);
  expect(field?.$ready).toBe(false);
  expect(field?.$pending).toBe(false);
  expect(field?.$correct).toBe(false);
  expect(field?.$errors).toStrictEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeUnRuledCorrectField(field?: RegleFieldStatus<any, any> | RegleSchemaFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$anyDirty).toBe(true);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$dirty).toBe(true);
  expect(field?.$correct).toBe(false);
  expect(field?.$ready).toBe(true);
  expect(field?.$errors).toStrictEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

export function shouldBeUnRuledSchemaCorrectField(field?: RegleSchemaFieldStatus<any, any>) {
  expect(field?.$invalid).toBe(false);
  expect(field?.$error).toBe(false);
  expect(field?.$anyDirty).toBe(true);
  if (field && '$pending' in field) {
    expect(field?.$pending).toBe(false);
  }
  expect(field?.$dirty).toBe(true);
  expect(field?.$ready).toBe(true);
  expect(field?.$errors).toStrictEqual([]);
  expect(field?.$touch).toBeInstanceOf(Function);
  expect(field?.$reset).toBeInstanceOf(Function);
}

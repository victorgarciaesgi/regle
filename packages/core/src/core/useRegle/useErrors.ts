import { isObject } from '../../../../shared';
import type { $InternalRegleCollectionErrors, $InternalRegleErrors, $InternalRegleFieldStatus } from '../../types';

export function extractRulesErrors({
  field,
  silent = false,
}: {
  field: Pick<$InternalRegleFieldStatus, '$rules' | '$error' | '$externalErrors'> & {
    $schemaErrors: string[] | undefined;
  };
  silent?: boolean;
}): string[] {
  return Object.entries(field.$rules ?? {})
    .map(([_, rule]) => {
      if (silent && !rule.$valid) {
        return rule.$message;
      } else if (!rule.$valid && field.$error && !rule.$validating) {
        return rule.$message;
      }

      return null;
    })
    .filter((msg): msg is string | string[] => !!msg)
    .reduce<string[]>((acc, value) => {
      if (typeof value === 'string') {
        return acc?.concat([value]);
      } else {
        return acc?.concat(value);
      }
    }, [])
    .concat(field.$error ? (field.$externalErrors ?? []) : [])
    .concat(field.$error ? (field.$schemaErrors ?? []) : []);
}

export function extractRulesTooltips({ field }: { field: Pick<$InternalRegleFieldStatus, '$rules'> }): string[] {
  return Object.entries(field.$rules ?? {})
    .map(([_, rule]) => rule.$tooltip)
    .filter((tooltip): tooltip is string | string[] => !!tooltip)
    .reduce<string[]>((acc, value) => {
      if (typeof value === 'string') {
        return acc?.concat([value]);
      } else {
        return acc?.concat(value);
      }
    }, []);
}

function isCollectionError(errors: $InternalRegleErrors): errors is $InternalRegleCollectionErrors {
  return isObject(errors) && '$each' in errors;
}

/**
 * Converts a nested $errors object to a flat array of string errors
 *
 * Can also flatten to an array containing the path of each error with the options.includePath
 */
export function flatErrors(
  errors: $InternalRegleErrors,
  options: { includePath: true }
): { error: string; path: string }[];
export function flatErrors(errors: $InternalRegleErrors, options?: { includePath?: false }): string[];
export function flatErrors(
  errors: $InternalRegleErrors,
  options?: { includePath?: boolean }
): (
  | string
  | {
      error: string;
      path: string;
    }
)[] {
  const { includePath = false } = options ?? {};
  if (Array.isArray(errors) && errors.every((err) => !isObject(err))) {
    // Field errors (string[])
    return errors;
  } else if (isCollectionError(errors)) {
    // Collections errors
    const selfErrors = includePath
      ? (errors.$self?.map((err) => ({ error: err, path: '' })) ?? [])
      : (errors.$self ?? []);
    const eachErrors = errors.$each?.map((err) => interateErrors(err, includePath)) ?? [];
    return selfErrors?.concat(eachErrors.flat());
  } else {
    // Nested errors
    return Object.entries(errors)
      .map(([key, value]) => interateErrors(value, includePath, [key]))
      .flat();
  }
}

function interateErrors(
  errors: $InternalRegleErrors,
  includePath = false,
  _path?: string[]
): (
  | string
  | {
      error: string;
      path: string;
    }
)[] {
  const path = includePath && !_path ? [] : _path;
  if (Array.isArray(errors) && errors.every((err) => !isObject(err))) {
    // Field errors (string[])
    if (includePath) {
      return errors.map((err) => ({ error: err, path: path?.join('.') ?? '' }));
    }
    return errors;
  } else if (isCollectionError(errors)) {
    // Collections errors
    const selfErrors = path?.length
      ? (errors.$self?.map((err) => ({ error: err, path: path.join('.') })) ?? [])
      : (errors.$self ?? []);
    const eachErrors =
      errors.$each?.map((err, index) => interateErrors(err, includePath, path?.concat(index.toString()))) ?? [];
    return selfErrors?.concat(eachErrors.flat());
  } else {
    // Nested errors
    return Object.entries(errors)
      .map(([key, value]) => interateErrors(value, includePath, path?.concat(key)))
      .flat();
  }
}

import { isObject } from '../../../../shared';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleErrors,
  $InternalRegleFieldStatus,
  RegleFieldIssue,
} from '../../types';
import type { StandardSchemaV1 } from '@standard-schema/spec';

type TempRegleFieldIssue = {
  $property: string;
  $rule: string;
  $type?: string;
  $message: string | string[];
};

export function extractRulesIssues({
  field,
  silent = false,
}: {
  field: Pick<$InternalRegleFieldStatus, '$rules' | '$error' | '$externalErrors'> & {
    $schemaErrors: RegleFieldIssue[] | undefined;
    fieldName: string;
  };
  silent?: boolean;
}): RegleFieldIssue[] {
  const issues = Object.entries(field.$rules ?? {}).map(([key, rule]) => {
    let message: string | string[] = '';
    if (silent && !rule.$valid) {
      message = rule.$message;
    } else if (!rule.$valid && field.$error && !rule.$validating) {
      message = rule.$message;
    } else {
      return null;
    }
    const issue: TempRegleFieldIssue = {
      $message: message,
      $property: field.fieldName,
      $rule: key,
      $type: rule.$type,
      ...(typeof rule.$metadata === 'object' ? rule.$metadata : {}),
    };
    return issue;
  });

  const filteredIssues = issues.filter((msg): msg is TempRegleFieldIssue => !!msg);
  const ruleIssues = filteredIssues.reduce<RegleFieldIssue[]>((acc, issue) => {
    if (typeof issue.$message === 'string') {
      acc.push(issue as unknown as RegleFieldIssue);
    } else {
      acc.push(...issue.$message.map((msg) => ({ ...issue, $message: msg })));
    }
    return acc;
  }, []);

  const externalIssues =
    field.$error && field.$externalErrors
      ? field.$externalErrors.map((error) => ({
          $message: error,
          $property: field.fieldName,
          $rule: 'external',
          $type: undefined,
        }))
      : [];

  let schemaIssues = [];
  if (field.$schemaErrors && field.$error) {
    if (!Array.isArray(field.$schemaErrors) && '$self' in field.$schemaErrors) {
      // @ts-expect-error Errors from primitives only arrays from regle schemas
      schemaIssues = field.$schemaErrors.$self ?? [];
    } else {
      schemaIssues = field.$schemaErrors ?? [];
    }
  }

  return [...ruleIssues, ...externalIssues, ...schemaIssues];
}

export function extractRulesTooltips({ field }: { field: Pick<$InternalRegleFieldStatus, '$rules'> }): string[] {
  const tooltips: string[] = [];
  for (const rule of Object.values(field.$rules ?? {})) {
    const tooltip = rule.$tooltip;
    if (tooltip) {
      if (typeof tooltip === 'string') {
        tooltips.push(tooltip);
      } else {
        tooltips.push(...tooltip);
      }
    }
  }
  return tooltips;
}

function isCollectionError(errors: $InternalRegleErrors): errors is $InternalRegleCollectionErrors {
  return isObject(errors) && '$each' in errors;
}

/**
 * Converts a nested $errors object to a flat array of string errors
 *
 * Can also flatten to an array containing the path of each error with the options.includePath
 */
export function flatErrors(errors: $InternalRegleErrors, options: { includePath: true }): StandardSchemaV1.Issue[];
export function flatErrors(errors: $InternalRegleErrors, options?: { includePath?: false }): string[];
export function flatErrors(
  errors: $InternalRegleErrors,
  options?: { includePath?: boolean }
): (string | StandardSchemaV1.Issue)[] {
  const { includePath = false } = options ?? {};
  if (Array.isArray(errors) && errors.every((err) => !isObject(err))) {
    // Field errors (string[])
    return errors;
  } else if (isCollectionError(errors)) {
    // Collections errors
    const selfErrors = includePath
      ? (errors.$self?.map((err) => ({ message: err, path: [] }) as StandardSchemaV1.Issue) ?? [])
      : (errors.$self ?? []);
    const eachErrors = errors.$each?.map((err) => iterateErrors(err, includePath)) ?? [];
    return selfErrors?.concat(eachErrors.flat());
  } else {
    // Nested errors
    return Object.entries(errors)
      .map(([key, value]) => iterateErrors(value, includePath, [key]))
      .flat();
  }
}

function iterateErrors(
  errors: $InternalRegleErrors,
  includePath = false,
  _path?: string[]
): (string | StandardSchemaV1.Issue)[] {
  const path = includePath && !_path ? [] : _path;
  if (Array.isArray(errors) && errors.every((err) => !isObject(err))) {
    // Field errors (string[])
    if (includePath) {
      return errors.map((err) => ({ message: err, path: path ?? [] }));
    }
    return errors;
  } else if (isCollectionError(errors)) {
    // Collections errors
    const selfErrors = path?.length
      ? (errors.$self?.map((err) => ({ message: err, path: path ?? [] }) as StandardSchemaV1.Issue) ?? [])
      : (errors.$self ?? []);
    const eachErrors =
      errors.$each?.map((err, index) => iterateErrors(err, includePath, path?.concat(index.toString()))) ?? [];
    return selfErrors?.concat(eachErrors.flat());
  } else {
    // Nested errors
    return Object.entries(errors)
      .map(([key, value]) => iterateErrors(value, includePath, path?.concat(key)))
      .flat();
  }
}

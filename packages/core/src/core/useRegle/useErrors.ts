import type { $InternalRegleFieldStatus } from '../../types';

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
      if (silent) {
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

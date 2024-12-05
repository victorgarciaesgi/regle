import type { $InternalRegleFieldStatus } from '../../types';

export function extractRulesErrors({
  field,
  silent = false,
}: {
  field: Pick<$InternalRegleFieldStatus, '$rules' | '$dirty' | '$externalErrors'>;
  silent?: boolean;
}): string[] {
  return Object.entries(field.$rules ?? {})
    .map(([ruleKey, rule]) => {
      if (silent) {
        return rule.$message;
      } else if (!rule.$valid && field.$dirty && !rule.$validating) {
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
    .concat(field.$dirty ? (field.$externalErrors ?? []) : []);
}

import { isEmpty } from '../../../../shared';

export function matchRegex(_value: string | number | null | undefined, ...expr: RegExp[]): boolean {
  if (isEmpty(_value)) {
    return true;
  }
  const value = typeof _value === 'number' ? _value.toString() : _value;
  return expr.every((reg) => {
    reg.lastIndex = 0;
    return reg.test(value);
  });
}

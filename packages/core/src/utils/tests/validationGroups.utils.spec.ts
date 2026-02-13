import { mergeArrayGroupProperties, mergeBooleanGroupProperties } from '../validationGroups.utils';

describe('validationGroups.utils', () => {
  it('should merge boolean properties', () => {
    const entries = [{ $invalid: false }, { $invalid: true }, {}];

    expect(mergeBooleanGroupProperties(entries as any, '$invalid')).toBe(true);
    expect(mergeBooleanGroupProperties(entries as any, '$error')).toBe(false);
  });

  it('should return false when boolean property is missing', () => {
    const entries = [{ $invalid: true }];

    expect(mergeBooleanGroupProperties(entries as any)).toBe(false);
  });

  it('should merge array properties', () => {
    const entries = [{ $errors: ['a'], $silentErrors: [] }, { $errors: ['b'], $silentErrors: ['c'] }, {}];

    expect(mergeArrayGroupProperties(entries as any, '$errors')).toStrictEqual(['a', 'b']);
    expect(mergeArrayGroupProperties(entries as any, '$silentErrors')).toStrictEqual(['c']);
  });

  it('should return an empty array when property is missing', () => {
    const entries = [{ $errors: ['a'] }];

    expect(mergeArrayGroupProperties(entries as any)).toStrictEqual([]);
  });
});

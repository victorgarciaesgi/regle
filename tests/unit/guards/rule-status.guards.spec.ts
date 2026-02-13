import {
  isCollectionExternalErrorStatus,
  isCollectionRulesStatus,
  isFieldStatus,
  isNestedExternalErrorStatus,
  isNestedRulesStatus,
  isRuleStatus,
} from '../../../packages/core/src/core/useRegle/guards/rule.status.guards';

describe('rule.status.guards', () => {
  it('should detect nested, collection and field statuses', () => {
    expect(isNestedRulesStatus({ $fields: {} } as any)).toBe(true);
    expect(isNestedRulesStatus({} as any)).toBe(false);

    expect(isCollectionRulesStatus({ $each: [] } as any)).toBe(true);
    expect(isCollectionRulesStatus(null as any)).toBe(false);

    expect(isFieldStatus({ $rules: {} } as any)).toBe(true);
    expect(isFieldStatus(undefined as any)).toBe(false);
  });

  it('should detect rule status shape', () => {
    expect(isRuleStatus({ $type: 'required', $message: 'Error' })).toBe(true);
    expect(isRuleStatus({ $type: 'required' })).toBe(false);
    expect(isRuleStatus(null)).toBe(false);
  });

  it('should detect nested and collection external errors', () => {
    const nested = { $each: [{ field: ['error'] }] };
    const regular = { field: ['error'] };

    expect(isNestedExternalErrorStatus(nested as any)).toBe(true);
    expect(isNestedExternalErrorStatus(regular as any)).toBe(false);

    expect(isCollectionExternalErrorStatus(nested as any)).toBe(true);
    expect(isCollectionExternalErrorStatus(regular as any)).toBe(false);
  });
});

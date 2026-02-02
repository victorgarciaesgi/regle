import { atLeastOne } from '../atLeastOne';

describe('atLeastOne validator', () => {
  it('should validate at least one key', () => {
    expect(atLeastOne.exec({ firstName: 'John', lastName: 'Doe' })).toBe(true);
    expect(atLeastOne.exec({ firstName: 'John' })).toBe(true);
    expect(atLeastOne.exec({ lastName: 'Doe' })).toBe(true);
    expect(atLeastOne.exec({})).toBe(false);
    expect(atLeastOne.exec(undefined)).toBe(true);
  });

  it('should check keys if arguments are provided', () => {
    expect(
      atLeastOne(['firstName', 'lastName']).exec({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' })
    ).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ firstName: 'John' })).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ lastName: 'Doe' })).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ email: 'john.doe@example.com' })).toBe(false);
    expect(atLeastOne(['firstName', 'lastName']).exec(undefined)).toBe(true);
  });
});

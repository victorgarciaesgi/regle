import { dotPathObjectToNested } from '../utils/object.utils';

describe('dotPathObjectToNested', () => {
  it('should convert a dot path object to a nested object', () => {
    expect(dotPathObjectToNested({ 'a.b.c': ['d'] })).toStrictEqual({ a: { b: { c: ['d'] } } });

    expect(dotPathObjectToNested({ collection: ['a'] })).toStrictEqual({ collection: ['a'] });

    expect(dotPathObjectToNested({ collection: ['a'], 'collection.0.name': ['b'] })).toStrictEqual({
      collection: { $self: ['a'], $each: [{ name: ['b'] }] },
    });

    expect(dotPathObjectToNested({ 'collection.0.name': ['b'], collection: ['a'] })).toStrictEqual({
      collection: { $self: ['a'], $each: [{ name: ['b'] }] },
    });
  });

  it('should wrap parent object errors in $self when child dot paths exist', () => {
    const expected = {
      user: { $self: ['user-level error'], email: ['email error'] },
    };

    expect(
      dotPathObjectToNested({
        user: ['user-level error'],
        'user.email': ['email error'],
      })
    ).toStrictEqual(expected);

    expect(
      dotPathObjectToNested({
        'user.email': ['email error'],
        user: ['user-level error'],
      })
    ).toStrictEqual(expected);
  });

  it('should keep parent-only errors without $self wrapper', () => {
    expect(dotPathObjectToNested({ user: ['user-level error'] })).toStrictEqual({
      user: ['user-level error'],
    });
  });

  it('should keep child-only dot path errors', () => {
    expect(dotPathObjectToNested({ 'user.email': ['email error'] })).toStrictEqual({
      user: { email: ['email error'] },
    });
  });

  it('should handle deep nesting with parent conflict', () => {
    expect(
      dotPathObjectToNested({
        user: ['user-level error'],
        'user.profile.email': ['email error'],
      })
    ).toStrictEqual({
      user: {
        $self: ['user-level error'],
        profile: { email: ['email error'] },
      },
    });
  });

  it('should return an empty object for undefined input', () => {
    expect(dotPathObjectToNested(undefined)).toStrictEqual({});
  });

  it('should use state to disambiguate object fields with numeric keys', () => {
    const errors = {
      data: ['data error'],
      'data.0': ['child error'],
    };
    const objectState = { data: { '0': 'value' } };
    const arrayState = { data: ['value'] };

    expect(dotPathObjectToNested(errors, objectState)).toStrictEqual({
      data: { $self: ['data error'], '0': ['child error'] },
    });

    expect(dotPathObjectToNested(errors, arrayState)).toStrictEqual({
      data: { $self: ['data error'], $each: [['child error']] },
    });
  });
});

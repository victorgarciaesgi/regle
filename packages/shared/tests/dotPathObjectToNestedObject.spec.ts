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
});

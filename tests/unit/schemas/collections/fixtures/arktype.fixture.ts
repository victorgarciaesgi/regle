import { type } from 'arktype';

export function arktypeFixture() {
  return type({
    name: 'string >= 1',
    array: type({
      test: 'string >= 1',
      nested_array: type({
        rest: 'string >= 1',
      }).array(),
    })
      .array()
      .atLeastLength(1)
      .configure({ message: () => 'Array must contain at least 1 element' }),
  });
}

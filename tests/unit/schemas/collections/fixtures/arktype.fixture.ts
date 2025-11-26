import { type } from 'arktype';

export function arktypeFixture() {
  return type({
    name: 'string >= 1',
    array: type({
      test: 'string >= 1',
      nested_array: type({
        rest: 'string >= 1',
      }).array(),
    }).array(),
  });
}

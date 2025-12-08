import * as v from 'valibot';

export function valibotFixture() {
  return v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    array: v.pipe(
      v.array(
        v.object({
          test: v.pipe(v.string(), v.minLength(1)),
          nested_array: v.array(
            v.object({
              rest: v.pipe(v.string(), v.minLength(1)),
            })
          ),
        })
      ),
      v.minLength(1, 'Array must contain at least 1 element')
    ),
  });
}

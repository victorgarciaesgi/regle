import * as v from 'valibot';

export function valibotFixture() {
  return v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    array: v.array(
      v.object({
        test: v.pipe(v.string(), v.minLength(1)),
        nested_array: v.array(
          v.object({
            rest: v.pipe(v.string(), v.minLength(1)),
          })
        ),
      })
    ),
  });
}

# Built-in Rules

All rules are exported from `@regle/rules`. Every built-in rule checks if the value is set before validating, so rules work even if the field is not required.

```ts
import { required, email, minLength } from '@regle/rules';
```

## String / General

| Rule | Description | Usage |
|------|-------------|-------|
| `required` | Non-empty data (trims whitespace, checks empty arrays) | `{ required }` |
| `requiredIf` | Required only if condition is truthy | `{ required: requiredIf(conditionRef) }` |
| `requiredUnless` | Required only if condition is falsy | `{ required: requiredUnless(conditionRef) }` |
| `email` | Valid email format | `{ email }` |
| `alpha` | Alphabetic only. Option: `allowSymbols` | `{ alpha }` or `{ alpha: alpha({ allowSymbols: true }) }` |
| `alphaNum` | Alphanumeric only. Option: `allowSymbols` | `{ alphaNum }` |
| `contains` | Contains substring | `{ contains: contains('regle') }` |
| `containsSpecialCharacter` | At least N special characters (default 1) | `{ containsSpecialCharacter }` or `{ containsSpecialCharacter: containsSpecialCharacter(2) }` |
| `containsUppercase` | At least N uppercase letters (default 1) | `{ containsUppercase }` or `{ containsUppercase: containsUppercase(2) }` |
| `startsWith` | Starts with string | `{ startsWith: startsWith('foo') }` |
| `endsWith` | Ends with string | `{ endsWith: endsWith('bar') }` |
| `regex` | Matches one or more regexps | `{ regex: regex(/^foo/) }` |
| `lowercase` | All lowercase | `{ lowercase }` |
| `uppercase` | All uppercase | `{ uppercase }` |
| `url` | Valid URL. Option: `protocol` regex | `{ url }` |
| `httpUrl` | Valid HTTP URL. Option: `protocol` regex | `{ httpUrl }` |
| `hostname` | Valid hostname | `{ hostname }` |
| `emoji` | Valid emoji | `{ emoji }` |
| `hexadecimal` | Valid hexadecimal | `{ hexadecimal }` |

## Numeric

| Rule | Description | Usage |
|------|-------------|-------|
| `numeric` | Numeric value (including numeric strings) | `{ numeric }` |
| `integer` | Integer only | `{ integer }` |
| `decimal` | Decimal number | `{ decimal }` |
| `minValue` | Minimum numeric value. Option: `allowEqual` | `{ minValue: minValue(5) }` |
| `maxValue` | Maximum numeric value. Option: `allowEqual` | `{ maxValue: maxValue(100) }` |
| `between` | Number in range. Option: `allowEqual` | `{ between: between(1, 10) }` |
| `exactValue` | Exact numeric value | `{ exactValue: exactValue(42) }` |

## Length

| Rule | Description | Usage |
|------|-------------|-------|
| `minLength` | Min length (string, array, object). Option: `allowEqual` | `{ minLength: minLength(3) }` |
| `maxLength` | Max length. Option: `allowEqual` | `{ maxLength: maxLength(255) }` |
| `exactLength` | Exact length | `{ exactLength: exactLength(6) }` |
| `exactDigits` | Exact number of digits | `{ exactDigits: exactDigits(4) }` |

## Date

| Rule | Description | Usage |
|------|-------------|-------|
| `dateAfter` | Date after parameter. Option: `allowEqual` | `{ dateAfter: dateAfter(new Date()) }` |
| `dateBefore` | Date before parameter. Option: `allowEqual` | `{ dateBefore: dateBefore(new Date()) }` |
| `dateBetween` | Date between two bounds. Option: `allowEqual` | `{ dateBetween: dateBetween(start, end) }` |

## Comparison

| Rule | Description | Usage |
|------|-------------|-------|
| `sameAs` | Matches another value | `{ sameAs: sameAs(() => form.value.password) }` |
| `literal` | Exact literal value (acts like required) | `{ literal: literal('foo') }` |
| `checked` | Boolean must be `true` (acts like required) | `{ checked }` |
| `oneOf` | One of allowed values | `{ oneOf: oneOf(['Fish', 'Meat']) }` |
| `nativeEnum` | TypeScript enum value | `{ nativeEnum: nativeEnum(MyEnum) }` |

## Network

| Rule | Description | Usage |
|------|-------------|-------|
| `ipv4Address` | Valid IPv4 address | `{ ipv4Address }` |
| `macAddress` | Valid MAC address. Optional separator | `{ macAddress }` or `{ macAddress: macAddress('-') }` |

## File

| Rule | Description | Usage |
|------|-------------|-------|
| `fileType` | File with specific MIME type(s) | `{ fileType: fileType(['image/png']) }` |
| `maxFileSize` | Max file size in bytes | `{ maxFileSize: maxFileSize(10_000_000) }` |
| `minFileSize` | Min file size in bytes | `{ minFileSize: minFileSize(1000) }` |

## Object

| Rule | Description | Usage |
|------|-------------|-------|
| `atLeastOne` | At least one key filled in object (use with `$self`) | `{ $self: { atLeastOne } }` |

## Type helpers (for `InferInput`)

These rules add no runtime validation but help TypeScript infer the field type:

| Rule | Inferred type |
|------|---------------|
| `string` | `string` |
| `number` | `number` |
| `boolean` | `boolean` |
| `date` | `Date` |
| `file` | `File` |
| `type<T>()` | Custom type `T` |

## Reactive parameters

All parameterized rules accept plain values, refs, or getter functions:

```ts
const max = ref(10);

useRegle({ count: 0 }, {
  count: {
    maxValue: maxValue(10),        // plain value
    maxValue: maxValue(max),       // ref
    maxValue: maxValue(() => max.value), // getter
  },
});
```

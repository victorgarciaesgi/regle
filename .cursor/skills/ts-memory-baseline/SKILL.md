---
name: ts-memory-baseline
description: Measure and compare TypeScript memory usage for @regle/core and test typechecks. Use when checking TS server pressure, type-level perf regressions, or before/after heavy generic typing changes.
metadata:
  author: regle
  version: "2026.03.19"
---

# TypeScript memory baseline procedure

This skill defines a reproducible process to measure TypeScript memory usage in this repository.

## Hard requirements

1. Use Node 24 for all measurements.
2. Run `pnpm build` before any test-related measurement.
3. `pnpm run test:typecheck` should never fail. If it fails, treat the run as invalid for regression tracking.

## Environment setup

```bash
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH"
node -v
pnpm -v
```

Expected:
- Node `v24.x`
- pnpm `10.33.0` (or project-compatible version)

## Measurement runbook (must follow)

1. Ensure no extra monorepo tasks are running.
2. Use the exact Node 24 PATH prefix in every command.
3. Run one warm-up pass that is discarded.
4. Run 3 measured passes and compare medians.
5. Save only the final medians in `tests/TS_MEMORY_BASELINE_RESULTS.md`.

## Measurement commands

### A. @regle/core compiler diagnostics

```bash
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
./node_modules/.bin/tsc -p "packages/core/tsconfig.json" --noEmit --extendedDiagnostics
```

Capture:
- `Memory used`
- `Instantiations`
- `Check time`

### B. Full type tests memory

Run build first:

```bash
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm build
```

Then:

```bash
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
/usr/bin/time -l pnpm run test:typecheck
```

Capture:
- exit code (must be `0`)
- `maximum resident set size`
- `peak memory footprint`
- `real/user/sys`

Recommended sequence:

```bash
# warm-up (discard)
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
/usr/bin/time -l corepack pnpm run test:typecheck

# measured runs (collect all 3)
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
/usr/bin/time -l corepack pnpm run test:typecheck
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
/usr/bin/time -l corepack pnpm run test:typecheck
PATH="/Users/victorgarcia/.nvm/versions/node/v24.14.0/bin:$PATH" \
/usr/bin/time -l corepack pnpm run test:typecheck
```

## Comparison protocol

Use median deltas because absolute values can vary with machine/CPU load.

1. Compute medians for old baseline and new run.
2. Compute delta % = `(new - old) / old * 100`.
3. Evaluate with these thresholds:
   - **Likely noise**: within `±5%` for memory metrics.
   - **Watch zone**: `>5%` and `<=10%` increase.
   - **Regression candidate**: `>10%` increase.
4. For `Check time` and `real time`, treat as noisy:
   - investigate only if increase is `>15%` and reproducible across runs.
5. If `pnpm run test:typecheck` exit code is non-zero, invalidate the run (do not update baseline).

## Results storage

Store only numeric outcomes in:

- `tests/TS_MEMORY_BASELINE_RESULTS.md`

Do not put procedural instructions in the results file.

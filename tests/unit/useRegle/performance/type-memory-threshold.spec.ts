import { spawnSync } from 'node:child_process';

type TsDiagnostics = {
  memoryUsedKb: number;
};

function readEnvNumber(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function runTypeDiagnostics(tsProjectPath: string): TsDiagnostics {
  const result = spawnSync('pnpm', ['exec', 'tsgo', '--noEmit', '--extendedDiagnostics', '-p', tsProjectPath], {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    const output = `${result.stdout}\n${result.stderr}`.trim();
    throw new Error(`Type diagnostics command failed for "${tsProjectPath}".\n${output}`);
  }

  const output = `${result.stdout}\n${result.stderr}`;
  const memoryUsed = output.match(/Memory used:\s+(\d+)K/);

  if (!memoryUsed) {
    throw new Error(`Could not parse "Memory used" from diagnostics for "${tsProjectPath}".\n${output}`);
  }

  return {
    memoryUsedKb: Number(memoryUsed[1]),
  };
}

describe('Type memory diagnostics thresholds', () => {
  const coreThresholdKb = readEnvNumber('REGLE_TS_MEMORY_CORE_THRESHOLD_KB', 300000);
  const rulesThresholdKb = readEnvNumber('REGLE_TS_MEMORY_RULES_THRESHOLD_KB', 360000);
  const allowedGrowthKb = readEnvNumber('REGLE_TS_MEMORY_ALLOWED_GROWTH_KB', 8000);

  it('keeps core type memory under threshold', () => {
    const diagnostics = runTypeDiagnostics('packages/core');
    expect(diagnostics.memoryUsedKb).toBeLessThanOrEqual(coreThresholdKb);
  }, 120000);

  it('keeps rules type memory under threshold', () => {
    const diagnostics = runTypeDiagnostics('packages/rules');
    expect(diagnostics.memoryUsedKb).toBeLessThanOrEqual(rulesThresholdKb);
  }, 120000);

  it('does not show significant memory growth across repeated runs', () => {
    const coreFirst = runTypeDiagnostics('packages/core').memoryUsedKb;
    const coreSecond = runTypeDiagnostics('packages/core').memoryUsedKb;
    const rulesFirst = runTypeDiagnostics('packages/rules').memoryUsedKb;
    const rulesSecond = runTypeDiagnostics('packages/rules').memoryUsedKb;

    const coreGrowth = coreSecond - coreFirst;
    const rulesGrowth = rulesSecond - rulesFirst;

    expect(coreGrowth).toBeLessThanOrEqual(allowedGrowthKb);
    expect(rulesGrowth).toBeLessThanOrEqual(allowedGrowthKb);
  }, 240000);
});

import type { SuperCompatibleRegleRoot } from '../rules';

export type ScopedInstancesRecord = Record<string, Record<string, SuperCompatibleRegleRoot>> & {
  '~~global': Record<string, SuperCompatibleRegleRoot>;
};
export type ScopedInstancesRecordLike = Partial<ScopedInstancesRecord>;

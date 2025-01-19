import type { RegleRuleDefinitionWithMetadataProcessor } from '@regle/core';
import type { ZodIssue } from 'zod';

export function extractIssuesMessages() {
  return ((metadata: { $issues: ZodIssue[] }) => {
    const issueMessages = metadata.$issues?.map((issue) => issue.message);
    return issueMessages?.length ? issueMessages : 'Error';
  }) satisfies RegleRuleDefinitionWithMetadataProcessor<any, any, any>;
}

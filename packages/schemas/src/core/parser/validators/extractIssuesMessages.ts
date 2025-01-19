import type { RegleRuleDefinitionWithMetadataProcessor } from '@regle/core';
import type * as v from 'valibot';

export function extractIssuesMessages() {
  return ((metadata: { $issues: v.BaseIssue<unknown>[] }) => {
    const issueMessages = metadata.$issues?.map((issue) => issue.message);
    return issueMessages.length ? issueMessages : 'Error';
  }) satisfies RegleRuleDefinitionWithMetadataProcessor<any, any, any>;
}

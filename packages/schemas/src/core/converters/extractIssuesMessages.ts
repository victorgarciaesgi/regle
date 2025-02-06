import type { RegleRuleDefinitionWithMetadataProcessor } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export function extractIssuesMessages() {
  return ((metadata: { $issues: StandardSchemaV1.Issue[] }) => {
    console.log('message:', metadata.$value, metadata.$issues);
    const issueMessages = metadata.$issues?.map((issue) => issue.message);
    if (issueMessages?.length) {
      return issueMessages.length ? issueMessages : 'Error';
    }
    return [];
  }) satisfies RegleRuleDefinitionWithMetadataProcessor<any, any, any>;
}

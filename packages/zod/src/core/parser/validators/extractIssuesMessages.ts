import type { ZodIssue } from 'zod';
import { z } from 'zod';

export function extractIssuesMessages() {
  return (value: unknown, metadata: { $issues: ZodIssue[] }) => {
    const issueMessages = metadata.$issues?.map((issue) => issue.message);
    return issueMessages.length ? issueMessages : 'Error';
  };
}

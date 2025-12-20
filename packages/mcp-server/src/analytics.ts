import { PostHog } from 'posthog-node';
import { version } from '../package.json';

let posthogClient: PostHog | null = null;

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;

if (POSTHOG_API_KEY) {
  posthogClient = new PostHog(POSTHOG_API_KEY, {
    host: 'https://eu.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });
}

export type ClientInfo = {
  clientName?: string;
  clientVersion?: string;
};

function getDistinctId(clientName?: string): string {
  return clientName || 'mcp-server-anonymous';
}

function getBaseProperties(clientInfo: ClientInfo) {
  return {
    client_name: clientInfo.clientName,
    client_version: clientInfo.clientVersion,
    regle_mcp_server_version: version,
  };
}

export function trackServerConnected(params: ClientInfo & { protocolVersion?: string }): void {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_server_connected',
    properties: {
      ...getBaseProperties(params),
      protocol_version: params.protocolVersion,
    },
  });
}

export function trackToolCall(
  params: ClientInfo & {
    toolName: string;
    success: boolean;
    errorMessage?: string;
  }
): void {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_tool_called',
    properties: {
      ...getBaseProperties(params),
      tool_name: params.toolName,
      success: params.success,
      ...(params.errorMessage && { error_message: params.errorMessage }),
    },
  });
}

export function trackSearchQuery(
  params: ClientInfo & {
    query: string;
    resultCount: number;
    toolName: string;
  }
) {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_search_query',
    properties: {
      ...getBaseProperties(params),
      query: params.query,
      result_count: params.resultCount,
      tool_name: params.toolName,
    },
  });
}

export function trackDocAccessed(
  params: ClientInfo & {
    docId: string;
    docCategory?: string;
  }
) {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_doc_accessed',
    properties: {
      ...getBaseProperties(params),
      doc_id: params.docId,
      doc_category: params.docCategory,
    },
  });
}

export function trackRuleLookup(
  params: ClientInfo & {
    ruleName: string;
    found: boolean;
  }
) {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_rule_lookup',
    properties: {
      ...getBaseProperties(params),
      rule_name: params.ruleName,
      found: params.found,
    },
  });
}

export function trackHelperLookup(
  params: ClientInfo & {
    helperName: string;
    found: boolean;
  }
) {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: getDistinctId(params.clientName),
    event: 'mcp_helper_lookup',
    properties: {
      ...getBaseProperties(params),
      helper_name: params.helperName,
      found: params.found,
    },
  });
}

export async function shutdown() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}

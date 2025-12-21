import { createHash } from 'crypto';
import { hostname, userInfo } from 'os';
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

/**
 * Get an anonymous hash to differentiate users without storing identifiable info
 */
function getMachineFingerprint(): string {
  const raw = [hostname(), userInfo().username].join('-');
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

function getBaseProperties(clientInfo: ClientInfo) {
  return {
    clientName: clientInfo.clientName,
    regleMcpServerVersion: version,
  };
}

export function captureEvent(
  event: string,
  clientInfo: ClientInfo,
  inputArgs?: { success: boolean; [key: string]: unknown }
) {
  if (!posthogClient) return;

  const { success, ...rest } = inputArgs ?? {};

  posthogClient.capture({
    distinctId: getMachineFingerprint(),
    event,
    properties: {
      success,
      ...getBaseProperties(clientInfo),
      ...(rest && { inputArgs: rest }),
    },
  });
}

export async function shutdown() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}

import { LinkedApiError, TWebhookEventSelector } from '@linkedapi/node';

export function parseWebhookEvents(input: string): Array<TWebhookEventSelector> {
  const events = input.split(',').map((event) => event.trim());

  if (events.some((event) => event.length === 0)) {
    throw new LinkedApiError(
      'invalidRequestPayload',
      'Provide a comma-separated list of event selectors.',
    );
  }

  return events as Array<TWebhookEventSelector>;
}

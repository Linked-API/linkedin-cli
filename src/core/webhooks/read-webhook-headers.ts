import { LinkedApiError } from '@linkedapi/node';
import { readStdin } from '@utils/read-stdin';

export async function readWebhookHeaders(): Promise<Record<string, string>> {
  const input = await readStdin();
  let headers: unknown;

  try {
    headers = JSON.parse(input);
  } catch {
    throw new LinkedApiError('invalidRequestPayload', 'Headers must be a JSON object of strings.');
  }

  if (
    typeof headers !== 'object' ||
    headers === null ||
    Array.isArray(headers) ||
    !Object.values(headers).every((value) => typeof value === 'string')
  ) {
    throw new LinkedApiError('invalidRequestPayload', 'Headers must be a JSON object of strings.');
  }

  if (Object.values(headers).some((value) => value.length === 0)) {
    throw new LinkedApiError(
      'invalidRequestPayload',
      'A header value is empty; use delete-header to remove a header or --clear to clear all headers.',
    );
  }

  return headers as Record<string, string>;
}

import LinkedApi, { buildLinkedApiHttpClient } from '@linkedapi/node';

interface TClientTokens {
  linkedApiToken: string;
  identificationToken: string;
}

const DEFAULT_API_BASE_URL = 'https://api.linkedapi.io' as const;

export function buildClient(tokens: TClientTokens): LinkedApi {
  const overrideBaseUrl = process.env.LINKED_API_BASE_URL?.trim();
  const baseUrl =
    overrideBaseUrl && overrideBaseUrl.length > 0 ? overrideBaseUrl : DEFAULT_API_BASE_URL;
  const httpClient = buildLinkedApiHttpClient({ ...tokens, client: 'cli' }, 'cli', baseUrl);
  return new LinkedApi(httpClient);
}

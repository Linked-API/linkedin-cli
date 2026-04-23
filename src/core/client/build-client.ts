import LinkedApi from '@linkedapi/node';

interface TClientTokens {
  linkedApiToken: string;
  identificationToken: string;
}

export function buildClient(tokens: TClientTokens): LinkedApi {
  const overrideBaseUrl = process.env.LINKED_API_BASE_URL?.trim();
  const baseUrl = overrideBaseUrl && overrideBaseUrl.length > 0 ? overrideBaseUrl : undefined;
  return new LinkedApi({ ...tokens, client: 'cli', baseUrl });
}

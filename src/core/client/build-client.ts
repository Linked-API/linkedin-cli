import LinkedApi from '@linkedapi/node';

interface TClientTokens {
  linkedApiToken: string;
  identificationToken: string;
}

export function buildClient(tokens: TClientTokens): LinkedApi {
  return new LinkedApi({
    ...tokens,
    client: 'cli'
  });
}

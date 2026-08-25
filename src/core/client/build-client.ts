import LinkedApi from '@linkedapi/node';

import { buildHttpClient } from './build-http-client';

interface TClientTokens {
  linkedApiToken: string;
  identificationToken: string;
}

export function buildClient(tokens: TClientTokens): LinkedApi {
  return new LinkedApi(buildHttpClient(tokens));
}

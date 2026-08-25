import { HttpClient } from '@linkedapi/node';
import { buildLinkedApiHttpClient } from '@linkedapi/node/dist/core';

import { TAuthTokens } from '@core/auth/auth-manager';

import { resolveClient } from './resolve-client';

function resolveBaseUrl(): string | undefined {
  const overrideBaseUrl = process.env.LINKED_API_BASE_URL?.trim();

  return overrideBaseUrl && overrideBaseUrl.length > 0 ? overrideBaseUrl : undefined;
}

export function buildHttpClient(tokens: TAuthTokens): HttpClient {
  return buildLinkedApiHttpClient(tokens, resolveClient(), resolveBaseUrl());
}

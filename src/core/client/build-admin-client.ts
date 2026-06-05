import { LinkedApiAdmin } from '@linkedapi/node';

import { resolveClient } from './resolve-client';

export function buildAdminClient(linkedApiToken: string): LinkedApiAdmin {
  return new LinkedApiAdmin({
    linkedApiToken,
    client: resolveClient(),
  });
}

import { LinkedApiAdmin } from '@linkedapi/node';

export function buildAdminClient(linkedApiToken: string): LinkedApiAdmin {
  return new LinkedApiAdmin({
    linkedApiToken,
    client: 'cli',
  });
}

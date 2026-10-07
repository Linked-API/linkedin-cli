import { formatAdminOutput } from '@core/output/admin-formatter';
import { TWebhookSubscription } from '@linkedapi/node';

export function formatWebhookOutput({
  data,
  isJson,
  fields,
}: {
  data: TWebhookSubscription | Array<TWebhookSubscription>;
  isJson: boolean;
  fields: string | undefined;
}): void {
  formatAdminOutput({
    data: Array.isArray(data) ? data.map(redactWebhookSecret) : redactWebhookSecret(data),
    isJson,
    fields,
  });

  for (const { id, secret } of Array.isArray(data) ? data : [data]) {
    if (secret !== undefined) {
      process.stderr.write(
        `Signing secret redacted. Use "linkedin admin webhook reveal-secret ${id} --print-secret" or "--secret-file <path>" to retrieve it.\n`,
      );
    }
  }
}

function redactWebhookSecret(webhook: TWebhookSubscription): TWebhookSubscription {
  if (webhook.secret === undefined) {
    return webhook;
  }

  return { ...webhook, secret: '[REDACTED]' };
}

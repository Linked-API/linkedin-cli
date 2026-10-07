import { AdminBaseCommand } from '@admin-base-command';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { readWebhookHeaders } from '@core/webhooks/read-webhook-headers';
import { Args, Flags } from '@oclif/core';

export default class WebhookSetHeaders extends AdminBaseCommand {
  static override description = 'Replace all custom webhook headers, or clear them';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    stdin: Flags.boolean({
      description: 'Read a JSON object of header names and values from stdin',
      exactlyOne: ['stdin', 'clear'],
    }),
    clear: Flags.boolean({
      description: 'Clear all custom headers',
      exactlyOne: ['stdin', 'clear'],
    }),
  };

  static override examples = [
    'cat headers.json | <%= config.bin %> admin webhook set-headers whs-123 --stdin',
    '<%= config.bin %> admin webhook set-headers whs-123 --clear',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSetHeaders);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.setHeaders({
        id: args.id,
        headers: flags.clear ? null : await readWebhookHeaders(),
      });

      formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}

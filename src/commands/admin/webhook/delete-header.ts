import { AdminBaseCommand } from '@admin-base-command';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { Args } from '@oclif/core';

export default class WebhookDeleteHeader extends AdminBaseCommand {
  static override description = 'Delete a custom webhook header by its case-insensitive name';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
    name: Args.string({ description: 'Custom header name', required: true }),
  };

  static override flags = { ...AdminBaseCommand.baseFlags };

  static override examples = [
    '<%= config.bin %> admin webhook delete-header whs-123 x-receiver-token',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookDeleteHeader);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.deleteHeader({ id: args.id, name: args.name });
      formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}

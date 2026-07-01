import { Args } from '@oclif/core';
import { TWebhookPayloadMode } from '@linkedapi/node';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class WebhookSetPayloadMode extends AdminBaseCommand {
  static override description = 'Switch the webhook payload mode between fat and thin';

  static override args = {
    id: Args.string({
      description: 'Webhook subscription id',
      required: true,
    }),
    mode: Args.string({
      description: 'fat inlines the workflow result; thin sends a reference only',
      options: ['fat', 'thin'],
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook set-payload-mode whs-123 thin'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSetPayloadMode);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.setPayloadMode({
        id: args.id,
        payloadMode: args.mode as TWebhookPayloadMode,
      });

      formatAdminOutput({
        data: webhook,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

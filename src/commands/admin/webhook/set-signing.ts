import { AdminBaseCommand } from '@admin-base-command';
import { formatWebhookOutput } from '@core/webhooks/format-webhook-output';
import { Args, Flags } from '@oclif/core';

export default class WebhookSetSigning extends AdminBaseCommand {
  static override description =
    'Enable or disable webhook signing; the returned secret is redacted';

  static override args = {
    id: Args.string({ description: 'Webhook subscription id', required: true }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    on: Flags.boolean({ description: 'Enable signing', exactlyOne: ['on', 'off'] }),
    off: Flags.boolean({ description: 'Disable signing', exactlyOne: ['on', 'off'] }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook set-signing whs-123 --on',
    '<%= config.bin %> admin webhook set-signing whs-123 --off',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSetSigning);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.setSigning({
        id: args.id,
        signingEnabled: flags.on === true,
      });

      formatWebhookOutput({ data: webhook, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}

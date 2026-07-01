import { Args, Flags } from '@oclif/core';
import { TWebhookPayloadMode } from '@linkedapi/node';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class WebhookSet extends AdminBaseCommand {
  static override description =
    'Register the outbound webhook that receives event deliveries (max one active per client)';

  static override args = {
    url: Args.string({
      description: 'HTTPS endpoint that will receive event deliveries',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    'payload-mode': Flags.string({
      description: 'fat inlines the workflow result; thin sends a reference to fetch via the API',
      options: ['fat', 'thin'],
      default: 'fat',
    }),
  };

  static override examples = [
    '<%= config.bin %> admin webhook set https://example.com/hooks/linkedapi',
    '<%= config.bin %> admin webhook set https://example.com/hooks --payload-mode thin',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookSet);
    const admin = await this.buildAdminClient();

    try {
      const webhook = await admin.webhooks.set({
        url: args.url,
        payloadMode: flags['payload-mode'] as TWebhookPayloadMode,
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

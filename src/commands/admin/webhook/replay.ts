import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class WebhookReplay extends AdminBaseCommand {
  static override description =
    'Re-arm an already-settled delivery for redelivery (reuses the same event id)';

  static override args = {
    deliveryId: Args.string({
      description: 'Webhook delivery id (from `webhook deliveries`)',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook replay whd-123'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookReplay);
    const admin = await this.buildAdminClient();

    try {
      await admin.webhooks.replayDelivery({ deliveryId: args.deliveryId });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Redelivery queued.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class WebhookDelete extends AdminBaseCommand {
  static override description =
    'Delete the webhook (soft-delete: delivery history is kept, pending deliveries are dropped)';

  static override args = {
    id: Args.string({
      description: 'Webhook subscription id',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook delete whs-123'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WebhookDelete);
    const admin = await this.buildAdminClient();

    try {
      await admin.webhooks.delete({ id: args.id });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Webhook deleted.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

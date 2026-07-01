import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class WebhookDeliveries extends AdminBaseCommand {
  static override description =
    'Show the most recent webhook deliveries (debug feed, newest first)';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook deliveries'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(WebhookDeliveries);
    const admin = await this.buildAdminClient();

    try {
      const deliveries = await admin.webhooks.deliveries();

      formatAdminOutput({
        data: deliveries,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

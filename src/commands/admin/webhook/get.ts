import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class WebhookGet extends AdminBaseCommand {
  static override description = 'List the active webhook subscription for this client';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook get'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(WebhookGet);
    const admin = await this.buildAdminClient();

    try {
      const webhooks = await admin.webhooks.get();

      formatAdminOutput({
        data: webhooks,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

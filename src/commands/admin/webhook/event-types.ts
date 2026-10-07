import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class WebhookEventTypes extends AdminBaseCommand {
  static override description =
    'List selectable webhook event types (webhook.test always delivers)';

  static override flags = { ...AdminBaseCommand.baseFlags };

  static override examples = ['<%= config.bin %> admin webhook event-types'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(WebhookEventTypes);
    const admin = await this.buildAdminClient();

    try {
      const eventTypes = await admin.webhooks.eventTypes();
      formatAdminOutput({ data: eventTypes, isJson: flags.json, fields: flags.fields });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class WebhookSendTest extends AdminBaseCommand {
  static override description =
    'Emit a synthetic webhook.test event to verify the endpoint end-to-end';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin webhook send-test'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(WebhookSendTest);
    const admin = await this.buildAdminClient();

    try {
      await admin.webhooks.sendTest();

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Test event queued for delivery.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

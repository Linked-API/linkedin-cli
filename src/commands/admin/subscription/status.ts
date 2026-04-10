import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionStatus extends AdminBaseCommand {
  static override description = 'Check subscription status';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin subscription status'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionStatus);
    const admin = await this.buildAdminClient();

    try {
      const status = await admin.subscription.getStatus();

      formatAdminOutput({
        data: status,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionCancel extends AdminBaseCommand {
  static override description = 'Cancel subscription at period end';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin subscription cancel'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionCancel);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.subscription.cancel();

      formatAdminOutput({
        data: result,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

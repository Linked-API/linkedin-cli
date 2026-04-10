import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionBillingLink extends AdminBaseCommand {
  static override description = 'Get billing portal link';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin subscription billing-link'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionBillingLink);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.subscription.getBillingLink();

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

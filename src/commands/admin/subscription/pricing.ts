import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionPricing extends AdminBaseCommand {
  static override description = 'View available pricing options';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin subscription pricing'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionPricing);
    const admin = await this.buildAdminClient();

    try {
      const { products } = await admin.subscription.getPricing();

      formatAdminOutput({
        data: products,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

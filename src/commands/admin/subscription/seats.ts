import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionSeats extends AdminBaseCommand {
  static override description = 'View current subscription seats';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin subscription seats'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionSeats);
    const admin = await this.buildAdminClient();

    try {
      const { seats } = await admin.subscription.getSeats();

      formatAdminOutput({
        data: seats,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { Flags } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminSubscriptionSetSeats extends AdminBaseCommand {
  static override description = 'Set subscription seats (updates existing or returns checkout link)';

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    quantity: Flags.integer({
      description: 'Number of seats (1-1000)',
      required: true,
      min: 1,
      max: 1000,
    }),
    type: Flags.string({
      description: 'Seat type',
      required: true,
      options: ['core', 'plus'],
    }),
    period: Flags.string({
      description: 'Billing period',
      required: true,
      options: ['month', 'year'],
    }),
  };

  static override examples = [
    '<%= config.bin %> admin subscription set-seats --quantity 5 --type plus --period year',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(AdminSubscriptionSetSeats);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.subscription.setSeats({
        quantity: flags.quantity,
        seatType: flags.type as 'core' | 'plus',
        billingPeriod: flags.period as 'month' | 'year',
      });

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

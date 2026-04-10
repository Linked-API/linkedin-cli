import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminLimitsUsage extends AdminBaseCommand {
  static override description = 'View current usage against limits';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin limits usage f9b4346a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminLimitsUsage);
    const admin = await this.buildAdminClient();

    try {
      const { usage } = await admin.limits.getUsage({ accountId: args.accountId });

      formatAdminOutput({
        data: usage,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

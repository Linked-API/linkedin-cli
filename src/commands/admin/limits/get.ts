import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminLimitsGet extends AdminBaseCommand {
  static override description = 'View current limits for an account';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin limits get f9b4346a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminLimitsGet);
    const admin = await this.buildAdminClient();

    try {
      const { limits } = await admin.limits.get({ accountId: args.accountId });

      formatAdminOutput({
        data: limits,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

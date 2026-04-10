import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class AdminAccountsDisconnect extends AdminBaseCommand {
  static override description = 'Disconnect a LinkedIn account (irreversible)';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts disconnect f9b4346a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminAccountsDisconnect);
    const admin = await this.buildAdminClient();

    try {
      await admin.accounts.disconnect({ accountId: args.accountId });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Account disconnected.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminAccountsRegenerateToken extends AdminBaseCommand {
  static override description = 'Regenerate identification token for an account';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts regenerate-token f9b4346a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminAccountsRegenerateToken);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.accounts.regenerateIdentificationToken({
        accountId: args.accountId,
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

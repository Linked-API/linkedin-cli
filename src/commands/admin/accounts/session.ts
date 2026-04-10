import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminOutput } from '@core/output/admin-formatter';

export default class AdminAccountsSession extends AdminBaseCommand {
  static override description = 'Check connection session status';

  static override args = {
    sessionId: Args.string({
      description: 'Session UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts session 990eef7a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminAccountsSession);
    const admin = await this.buildAdminClient();

    try {
      const result = await admin.accounts.getConnectionSession({
        sessionId: args.sessionId,
      });

      formatAdminOutput({
        data: result.session,
        isJson: flags.json,
        fields: flags.fields,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

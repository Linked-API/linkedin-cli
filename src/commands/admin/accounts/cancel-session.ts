import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class AdminAccountsCancelSession extends AdminBaseCommand {
  static override description = 'Cancel a pending connection session';

  static override args = {
    sessionId: Args.string({
      description: 'Session UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin accounts cancel-session 990eef7a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminAccountsCancelSession);
    const admin = await this.buildAdminClient();

    try {
      await admin.accounts.cancelConnectionSession({
        sessionId: args.sessionId,
      });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Connection session cancelled.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { Args } from '@oclif/core';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class AdminLimitsReset extends AdminBaseCommand {
  static override description = 'Reset all limits to defaults';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> admin limits reset f9b4346a-...'];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminLimitsReset);
    const admin = await this.buildAdminClient();

    try {
      await admin.limits.resetToDefaults({ accountId: args.accountId });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Limits reset to defaults.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

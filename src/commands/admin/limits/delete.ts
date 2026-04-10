import { Args, Flags } from '@oclif/core';
import type { TLimitCategory, TLimitPeriod } from '@linkedapi/node';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class AdminLimitsDelete extends AdminBaseCommand {
  static override description = 'Delete specific limits (falls back to defaults)';

  static override args = {
    accountId: Args.string({
      description: 'Account UUID',
      required: true,
    }),
  };

  static override flags = {
    ...AdminBaseCommand.baseFlags,
    category: Flags.string({
      description: 'Limit category',
      required: true,
    }),
    period: Flags.string({
      description: 'Limit period',
      required: true,
      options: ['daily', 'weekly', 'monthly'],
    }),
  };

  static override examples = [
    '<%= config.bin %> admin limits delete f9b4346a-... --category stMessages --period daily',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminLimitsDelete);
    const admin = await this.buildAdminClient();

    try {
      await admin.limits.delete({
        accountId: args.accountId,
        limits: [
          {
            category: flags.category as TLimitCategory,
            period: flags.period as TLimitPeriod,
          },
        ],
      });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Limit deleted.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

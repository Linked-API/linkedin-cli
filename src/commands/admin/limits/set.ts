import { Args, Flags } from '@oclif/core';
import type { TLimitCategory, TLimitPeriod } from '@linkedapi/node';

import { AdminBaseCommand } from '@admin-base-command';
import { formatAdminVoidOutput } from '@core/output/admin-formatter';

export default class AdminLimitsSet extends AdminBaseCommand {
  static override description = 'Set limits for an account';

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
    max: Flags.integer({
      description: 'Maximum allowed actions (>= 0)',
      required: true,
      min: 0,
    }),
  };

  static override examples = [
    '<%= config.bin %> admin limits set f9b4346a-... --category stMessages --period daily --max 25',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminLimitsSet);
    const admin = await this.buildAdminClient();

    try {
      await admin.limits.set({
        accountId: args.accountId,
        limits: [
          {
            category: flags.category as TLimitCategory,
            period: flags.period as TLimitPeriod,
            maxValue: flags.max,
          },
        ],
      });

      formatAdminVoidOutput({
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Limit set.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

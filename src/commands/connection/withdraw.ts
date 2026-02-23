import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';

export default class ConnectionWithdraw extends BaseCommand {
  static override description = 'Withdraw a pending connection request';

  static override args = {
    url: Args.string({
      description: 'LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    unfollow: Flags.boolean({
      description: 'Also unfollow the person (default: true)',
      allowNo: true,
      default: true,
    }),
  };

  static override examples = [
    '<%= config.bin %> connection withdraw https://www.linkedin.com/in/john-doe',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionWithdraw);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.withdrawConnectionRequest,
        {
          personUrl: args.url,
          unfollow: flags.unfollow,
        },
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Connection request withdrawn.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

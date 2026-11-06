import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args } from '@oclif/core';

export default class NavigatorCompanyUnsave extends BaseCommand {
  static override readonly description =
    'Unsave Account in Sales Navigator (Plus required). Unsave the account only; its saved leads stay saved. Repeating succeeds without changes. Sales Navigator can take up to a few minutes to reflect a change. A call that conflicts with a change you just made through Linked API may fail with unexpectedError; retry it a little later.' as const;

  static override readonly args = {
    url: Args.string({
      description:
        'LinkedIn URL accepted by the Sales Navigator opener, including alert subject URLs',
      required: true,
    }),
  };

  static override readonly flags = {
    ...BaseCommand.baseFlags,
  };

  static override readonly examples = [
    '<%= config.bin %> navigator company unsave https://www.linkedin.com/company/example-company --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorCompanyUnsave);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvUnsaveAccount,
        { companyHashedUrl: args.url },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Unsave Account completed.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

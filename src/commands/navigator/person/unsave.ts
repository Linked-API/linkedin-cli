import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args } from '@oclif/core';

export default class NavigatorPersonUnsave extends BaseCommand {
  static override readonly description =
    "Unsave Lead in Sales Navigator (Plus required). Use Sales Navigator's native unsave: the lead is no longer saved and leaves every custom list the user owns. Repeating succeeds without changes. Sales Navigator can take up to a few minutes to reflect a change. A call that conflicts with a change you just made through Linked API may fail with unexpectedError; retry it a little later." as const;

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
    '<%= config.bin %> navigator person unsave https://www.linkedin.com/in/example-person --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorPersonUnsave);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvUnsaveLead,
        { personHashedUrl: args.url },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Unsave Lead completed.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

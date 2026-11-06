import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorCompanySave extends BaseCommand {
  static override readonly description =
    'Save Account in Sales Navigator (Plus required). Ensure an account is saved; with listId, also ensure membership in that one list, leaving other lists untouched. Without listId, leave lists unchanged. Repeating succeeds without changes. Sales Navigator can take up to a few minutes to reflect a change. A call that conflicts with a change you just made through Linked API may fail with unexpectedError; retry it a little later.' as const;

  static override readonly args = {
    url: Args.string({
      description:
        'LinkedIn URL accepted by the Sales Navigator opener, including alert subject URLs',
      required: true,
    }),
  };

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    'list-id': Flags.string({
      description:
        'Optional string ID, never a number. Eligible: owned custom account lists or My Current Accounts; other targets return listNotFound. Current limitation: If you have more than 10 account lists, Sales Navigator shows ten lists at a time. If the requested list is not shown, the call fails with unexpectedError. The account may already be saved, but not added to that list.',
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> navigator company save https://www.linkedin.com/company/example-company --list-id 7420000000000000001 --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorCompanySave);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvSaveAccount,
        {
          companyHashedUrl: args.url,
          ...(flags['list-id'] === undefined ? {} : { listId: flags['list-id'] }),
        },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Save Account completed.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

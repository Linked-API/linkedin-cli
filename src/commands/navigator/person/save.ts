import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorPersonSave extends BaseCommand {
  static override readonly description =
    'Save Lead in Sales Navigator (Plus required). Ensure a lead is saved; with listId, also ensure membership in that one list, leaving other lists untouched. Without listId, leave lists unchanged. Repeating succeeds without changes. Saving a lead may also save its current company in Sales Navigator. Sales Navigator can take up to a few minutes to reflect a change. A call that conflicts with a change you just made through Linked API may fail with unexpectedError; retry it a little later.' as const;

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
        'Optional string ID, never a number. Eligible: owned custom lead lists; other targets return listNotFound. Current limitation: If you have more than 10 lead lists, Sales Navigator shows ten lists at a time. If the requested list is not shown, the call fails with unexpectedError. The lead may already be saved, but not added to that list.',
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> navigator person save https://www.linkedin.com/in/example-person --list-id 7420000000000000001 --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorPersonSave);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvSaveLead,
        {
          personHashedUrl: args.url,
          ...(flags['list-id'] === undefined ? {} : { listId: flags['list-id'] }),
        },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Save Lead completed.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

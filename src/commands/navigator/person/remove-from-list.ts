import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorPersonRemoveFromList extends BaseCommand {
  static override readonly description =
    'Remove a lead from exactly one owned custom list, keeping it saved and in its other lists. Repeating an absent membership succeeds. English interface only.' as const;
  static override readonly args = {
    url: Args.string({
      required: true,
      description:
        'Public or hashed LinkedIn person URL, including /in/... and /sales/lead/... or an alert subject URL.',
    }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    'list-id': Flags.string({
      description: 'Owned list ID as a string, never a number.',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorPersonRemoveFromList);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvRemoveLeadFromList,
        {
          personHashedUrl: args['url'],
          listId: flags['list-id'],
        },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Lead removed from list.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

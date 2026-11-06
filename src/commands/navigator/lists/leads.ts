import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorListsLeads extends BaseCommand {
  static override readonly description =
    'Retrieve list leads from an owned Sales Navigator list.' as const;
  static override readonly args = {
    'list-id': Args.string({
      required: true,
      description: 'Owned list ID as a string, never a number.',
    }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      description: 'Maximum matching members, 1\u20131000; default 25.',
      min: 1,
      max: 1000,
      default: 25,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorListsLeads);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvRetrieveListLeads,
        {
          listId: args['list-id'],
          limit: flags['limit'],
        },
        { isQuiet: flags.quiet },
      );
      formatOutput({
        data: result.data,
        fields: flags.fields,
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

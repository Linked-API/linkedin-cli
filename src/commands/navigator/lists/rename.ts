import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorListsRename extends BaseCommand {
  static override readonly description =
    'Rename an owned custom list. Trimmed name: 1–75 characters, no line breaks. Same name succeeds; duplicates return listAlreadyExists and system lists return listNotRenamable. English interface only.' as const;
  static override readonly args = {
    'list-id': Args.string({
      required: true,
      description: 'Owned list ID as a string, never a number.',
    }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    name: Flags.string({
      description: 'Trimmed name, 1\u201375 characters without line breaks.',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorListsRename);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvRenameList,
        {
          listId: args['list-id'],
          name: flags['name'],
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

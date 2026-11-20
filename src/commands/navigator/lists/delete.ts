import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { TNvDeleteListUnsave } from '@linkedapi/node';
import { Args, Flags } from '@oclif/core';

export default class NavigatorListsDelete extends BaseCommand {
  static override readonly description =
    'Delete one owned Sales Navigator list by string ID (Plus required). By default its members stay saved and in their other lists; --unsave members also unsaves them, which removes them from your other lists too. Unknown, shared or already-deleted IDs return listNotFound; system lists without Delete return listNotDeletable. Success has no result data.' as const;

  static override readonly args = {
    'list-id': Args.string({
      description: 'Owned list ID as a string, never a number',
      required: true,
    }),
  };

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    unsave: Flags.string({
      description:
        'none (default) keeps the members saved; members also unsaves them, removing them from your other lists',
      options: ['none', 'members'],
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> navigator lists delete 7420000000000000001 --json',
    '<%= config.bin %> navigator lists delete 7420000000000000001 --unsave members',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorListsDelete);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvDeleteList,
        { listId: args['list-id'], unsave: flags.unsave as TNvDeleteListUnsave | undefined },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Delete list completed.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

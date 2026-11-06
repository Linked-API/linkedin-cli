import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args } from '@oclif/core';

export default class NavigatorSavedSearchesDelete extends BaseCommand {
  static override readonly description =
    'Delete an owned saved search by its string ID. An absent search returns savedSearchNotFound. English interface only.' as const;
  static override readonly args = {
    'saved-search-id': Args.string({
      required: true,
      description: 'Owned saved-search ID as a positive decimal string.',
    }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorSavedSearchesDelete);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvDeleteSavedSearch,
        {
          savedSearchId: args['saved-search-id'],
        },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Saved search deleted.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

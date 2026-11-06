import { BaseCommand } from '@base-command';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorCompanyRemoveFromList extends BaseCommand {
  static override readonly description =
    'Remove an account from exactly one owned custom list, keeping it saved even after its last list. Repeating an absent membership succeeds. English interface only.' as const;
  static override readonly args = {
    url: Args.string({
      required: true,
      description:
        'Public or hashed LinkedIn company URL, including /company/... and /sales/company/... or an alert subject URL.',
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
    const { args, flags } = await this.parse(NavigatorCompanyRemoveFromList);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runVoidWorkflow(
        client.nvRemoveAccountFromList,
        {
          companyHashedUrl: args['url'],
          listId: flags['list-id'],
        },
        { isQuiet: flags.quiet },
      );
      formatVoidOutput({
        successMessage: 'Account removed from list.',
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

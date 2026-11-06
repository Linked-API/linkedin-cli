import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class NavigatorSavedSearchesCreate extends BaseCommand {
  static override readonly description =
    'Save a Sales Navigator search URL matching the requested type. Returns its id, name, type and URL. English interface only.' as const;
  static override readonly args = {
    'search-url': Args.string({
      required: true,
      description:
        'Sales Navigator search URL copied from /sales/search/people for lead or /sales/search/company for account; must match type.',
    }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Sales Navigator subject type.',
      options: ['lead', 'account'],
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorSavedSearchesCreate);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvCreateSavedSearch,
        {
          type: flags['type'] as 'lead' | 'account',
          customSearchUrl: args['search-url'],
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

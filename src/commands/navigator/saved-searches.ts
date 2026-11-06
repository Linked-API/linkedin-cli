import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class NavigatorSavedSearches extends BaseCommand {
  static override readonly description =
    'Retrieve owned saved searches of the requested type.' as const;
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Sales Navigator subject type.',
      options: ['lead', 'account'],
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorSavedSearches);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvRetrieveSavedSearches,
        {
          type: flags['type'] as 'lead' | 'account',
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

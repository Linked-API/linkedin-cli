import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class NavigatorLists extends BaseCommand {
  static override readonly description =
    'Retrieve Lists in Sales Navigator (Plus required). Retrieve every owned Sales Navigator list of the requested type. Results contain id (string), name, type (lead/account), source (open upstream string), entityCount (number or null), and url.' as const;

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Owned list type',
      options: ['lead', 'account'],
      required: true,
    }),
  };

  static override readonly examples = ['<%= config.bin %> navigator lists --type lead --json'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorLists);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvRetrieveLists,
        { type: flags.type as 'lead' | 'account' },
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

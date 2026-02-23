import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class StatsSsi extends BaseCommand {
  static override description = 'Retrieve your LinkedIn Social Selling Index (SSI)';

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> stats ssi --json'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(StatsSsi);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runWorkflow(client.retrieveSSI, {}, {
        isQuiet: flags.quiet,
      });

      formatOutput({
        data: result.data,
        errors: result.errors,
        isJson: flags.json,
        fields: flags.fields,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

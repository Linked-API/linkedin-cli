import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class StatsPerformance extends BaseCommand {
  static override description = 'Retrieve your LinkedIn performance analytics';

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = ['<%= config.bin %> stats performance --json'];

  public async run(): Promise<void> {
    const { flags } = await this.parse(StatsPerformance);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runWorkflow(client.retrievePerformance, undefined as unknown as void, {
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

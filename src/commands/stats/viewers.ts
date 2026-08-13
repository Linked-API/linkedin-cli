import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class StatsViewers extends BaseCommand {
  static override readonly description = 'Retrieve the people who recently viewed your profile';

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      description: 'Max viewers to retrieve',
      min: 1,
      max: 300,
    }),
    since: Flags.string({
      description: 'Only viewers seen at or after this ISO 8601 timestamp',
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> stats viewers',
    '<%= config.bin %> stats viewers --limit 50 --json',
    '<%= config.bin %> stats viewers --since 2026-08-01T00:00:00Z',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(StatsViewers);
    const client = await this.buildAuthenticatedClient();
    const params = {
      ...(flags.limit === undefined ? {} : { limit: flags.limit }),
      ...(flags.since === undefined ? {} : { since: flags.since }),
    };

    try {
      const result = await runWorkflow(client.retrieveProfileViewers, params, {
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

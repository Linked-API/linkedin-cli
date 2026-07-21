import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class FeedRetrieve extends BaseCommand {
  static override readonly description = 'Retrieve posts from your personalized LinkedIn home feed';

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      description: 'Max posts to retrieve',
      min: 1,
      max: 100,
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> feed retrieve',
    '<%= config.bin %> feed retrieve --limit 50 --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(FeedRetrieve);
    const client = await this.buildAuthenticatedClient();
    const params = flags.limit === undefined ? {} : { limit: flags.limit };

    try {
      const result = await runWorkflow(client.retrieveFeed, params, {
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

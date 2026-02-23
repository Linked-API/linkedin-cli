import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class NavigatorPersonFetch extends BaseCommand {
  static override description = 'Fetch a person profile via Sales Navigator';

  static override args = {
    'hashed-url': Args.string({
      description: 'Hashed LinkedIn profile URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> navigator person fetch https://www.linkedin.com/in/ACwAAA...',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorPersonFetch);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runWorkflow(
        client.nvFetchPerson,
        {
          personHashedUrl: args['hashed-url'],
        },
        {
          isQuiet: flags.quiet,
        },
      );

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

import { Args } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class JobsFetch extends BaseCommand {
  static override description = 'Fetch a LinkedIn job';

  static override args = {
    url: Args.string({
      description: 'LinkedIn job URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> jobs fetch https://www.linkedin.com/jobs/view/4416248954/',
    '<%= config.bin %> jobs fetch https://www.linkedin.com/jobs/view/4416248954/ --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(JobsFetch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      jobUrl: args.url,
    };

    try {
      const result = await runWorkflow(client.fetchJob, params, {
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

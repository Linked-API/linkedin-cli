import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';

export default class WorkflowStatus extends BaseCommand {
  static override description = `Check status of a running workflow or wait for completion.

See https://linkedapi.io/docs/executing-workflows/ for details on workflow execution and polling.`;

  static override args = {
    id: Args.string({
      description: 'Workflow ID',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    wait: Flags.boolean({
      description: 'Wait for workflow to complete',
      default: false,
    }),
  };

  static override examples = [
    '<%= config.bin %> workflow status abc123',
    '<%= config.bin %> workflow status abc123 --wait --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WorkflowStatus);

    const client = await this.buildAuthenticatedClient();

    try {
      if (flags.wait) {
        if (!flags.quiet) {
          process.stderr.write(`Waiting for workflow ${args.id}...\n`);
        }

        const result = await client.customWorkflow.result(args.id);

        formatOutput({
          data: result.data,
          errors: result.errors,
          isJson: flags.json,
          fields: flags.fields,
          isQuiet: flags.quiet,
        });
      } else {
        const status = await client.customWorkflow.status(args.id);

        if (status === 'running') {
          formatOutput({
            data: {
              workflowId: args.id,
              status: 'running',
            },
            errors: [],
            isJson: flags.json,
            fields: flags.fields,
            isQuiet: flags.quiet,
          });
        } else {
          formatOutput({
            data: status.data,
            errors: status.errors,
            isJson: flags.json,
            fields: flags.fields,
            isQuiet: flags.quiet,
          });
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}

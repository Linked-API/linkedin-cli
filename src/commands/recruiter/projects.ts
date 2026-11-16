import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class RecruiterProjects extends BaseCommand {
  static override readonly description =
    "Retrieve Projects. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {};
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({ min: 1, max: 1000, default: 25 }),
  };
  public async run(): Promise<void> {
    const { flags } = await this.parse(RecruiterProjects);
    const params = { limit: flags.limit };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcRetrieveProjects, params, { isQuiet: flags.quiet });
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

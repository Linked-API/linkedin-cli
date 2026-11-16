import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class RecruiterProjectsCreate extends BaseCommand {
  static override readonly description =
    "Create Project. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan. Creation is not idempotent: after a failure, check your projects before creating again (a duplicate can only be archived).";
  static override readonly args = {};
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    name: Flags.string({ required: true, description: 'Project name, 1–100 characters, one line' }),
  };
  public async run(): Promise<void> {
    const { flags } = await this.parse(RecruiterProjectsCreate);
    const params = { name: flags.name };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcCreateProject, params, { isQuiet: flags.quiet });
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

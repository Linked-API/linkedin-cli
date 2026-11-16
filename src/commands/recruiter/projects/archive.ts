import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args } from '@oclif/core';

export default class RecruiterProjectsArchive extends BaseCommand {
  static override readonly description =
    "Archive Project. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {
    'project-id': Args.string({ required: true, description: 'Project ID as a string of digits' }),
  };
  static override readonly flags = { ...BaseCommand.baseFlags };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterProjectsArchive);
    const params = { projectId: args['project-id'] };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcArchiveProject, params, { isQuiet: flags.quiet });
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

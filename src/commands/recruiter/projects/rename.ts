import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class RecruiterProjectsRename extends BaseCommand {
  static override readonly description =
    "Rename Project. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {
    'project-id': Args.string({ required: true, description: 'Project ID as a string of digits' }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    name: Flags.string({ required: true, description: 'Project name, 1–100 characters, one line' }),
    description: Flags.string({ description: 'Up to 2000 characters; omit to leave unchanged' }),
  };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterProjectsRename);
    const params = {
      projectId: args['project-id'],
      name: flags.name,
      ...(flags.description === undefined ? {} : { description: flags.description }),
    };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcRenameProject, params, { isQuiet: flags.quiet });
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

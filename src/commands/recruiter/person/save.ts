import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class RecruiterPersonSave extends BaseCommand {
  static override readonly description =
    "Save to Project. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {
    url: Args.string({ required: true, description: 'Recruiter profile URL' }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    'project-id': Flags.string({ required: true, description: 'Project ID as a string of digits' }),
  };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterPersonSave);
    const params = { personUrl: args.url, projectId: flags['project-id'] };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcSaveToProject, params, { isQuiet: flags.quiet });
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

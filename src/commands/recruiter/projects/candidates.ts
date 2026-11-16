import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class RecruiterProjectsCandidates extends BaseCommand {
  static override readonly description =
    "Retrieve Project Candidates. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {
    'project-id': Args.string({ required: true, description: 'Project ID as a string of digits' }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    stage: Flags.string({ options: ['uncontacted', 'contacted', 'replied', 'archived'] }),
    limit: Flags.integer({ min: 1, max: 1000, default: 25 }),
  };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterProjectsCandidates);
    const params = {
      projectId: args['project-id'],
      ...(flags.stage ? { stage: flags.stage } : {}),
      limit: flags.limit,
    };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcRetrieveProjectCandidates, params, {
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

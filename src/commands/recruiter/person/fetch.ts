import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class RecruiterPersonFetch extends BaseCommand {
  static override readonly description =
    "Fetch Person. Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan.";
  static override readonly args = {
    url: Args.string({ required: true, description: 'Recruiter profile URL' }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    'basic-info': Flags.boolean({
      default: true,
      allowNo: true,
      description: 'Read candidate details (default true)',
    }),
    'recruiting-activity': Flags.boolean({
      default: false,
      allowNo: true,
      description: 'Read recruiting activity counts',
    }),
  };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterPersonFetch);
    const params = {
      personUrl: args.url,
      basicInfo: flags['basic-info'],
      recruitingActivity: flags['recruiting-activity'],
    };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcFetchPerson, params, { isQuiet: flags.quiet });
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

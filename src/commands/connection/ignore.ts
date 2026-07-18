import { BaseCommand } from '@base-command';
import { buildInvitationTarget } from '@core/invitations/invitation-target';
import { INVITATION_TYPES } from '@core/invitations/invitation-types';
import { formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow } from '@core/workflow/workflow-runner';
import { Args } from '@oclif/core';

export default class ConnectionIgnore extends BaseCommand {
  static override description = 'Ignore an incoming invitation';

  static override args = {
    type: Args.string({
      description: 'Invitation type',
      required: true,
      options: INVITATION_TYPES,
    }),
    url: Args.string({
      description: 'Person, company, or newsletter URL matching the invitation type',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
  };

  static override examples = [
    '<%= config.bin %> connection ignore connect https://www.linkedin.com/in/john-doe',
    '<%= config.bin %> connection ignore companyFollow https://www.linkedin.com/company/example',
    '<%= config.bin %> connection ignore newsletterSubscribe https://www.linkedin.com/newsletters/example-1234567890',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConnectionIgnore);

    const client = await this.buildAuthenticatedClient();

    try {
      const result = await runVoidWorkflow(
        client.ignoreInvitation,
        buildInvitationTarget(args.type, args.url),
        {
          isQuiet: flags.quiet,
        },
      );

      formatVoidOutput({
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
        successMessage: 'Invitation ignored.',
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

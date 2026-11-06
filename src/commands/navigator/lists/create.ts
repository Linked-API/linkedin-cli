import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Flags } from '@oclif/core';

export default class NavigatorListsCreate extends BaseCommand {
  static override readonly description =
    'Create an owned Sales Navigator lead or account list (Plus required). Name is trimmed (1–75 characters). Optional description has surrounding spaces trimmed, allows up to 350 characters after trimming, and is omitted when blank. Same-type names equal after trimming, case-sensitive, including system lists, return listAlreadyExists and create nothing. Returns id (string), name, type and url. English interface only.' as const;

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    type: Flags.string({
      description: 'Owned list type',
      options: ['lead', 'account'],
      required: true,
    }),
    name: Flags.string({
      description: 'Name, trimmed; 1–75 characters after trimming',
      required: true,
    }),
    description: Flags.string({
      description:
        'Optional description; surrounding spaces are trimmed. Up to 350 characters after trimming; blank omitted',
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> navigator lists create --type lead --name "Prospects" --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorListsCreate);
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(
        client.nvCreateList,
        {
          type: flags.type as 'lead' | 'account',
          name: flags.name,
          ...(flags.description === undefined ? {} : { description: flags.description }),
        },
        { isQuiet: flags.quiet },
      );
      formatOutput({
        data: result.data,
        fields: flags.fields,
        errors: result.errors,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import type { TNvRetrieveAlertsParams } from '@linkedapi/node';
import { Flags } from '@oclif/core';

export default class NavigatorAlerts extends BaseCommand {
  static override readonly description =
    'Retrieve Sales Navigator lead and account alerts' as const;

  static override readonly flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      description: 'Maximum matching alerts',
      min: 1,
      max: 1000,
      default: 50,
    }),
    sort: Flags.string({
      description: 'Alert ordering',
      options: ['latest', 'relevance'],
      default: 'latest',
    }),
    category: Flags.string({
      description: 'Subject category (omit for both)',
      options: ['lead', 'account'],
    }),
    types: Flags.string({
      description: 'Exact machine codes, comma-separated; empty means unrestricted',
    }),
    since: Flags.string({ description: 'Inclusive ISO timestamp cutoff' }),
    'exclude-suggested': Flags.boolean({
      description:
        'Return only subjects confirmed as saved; exclude unsaved and unknown saved states',
      default: false,
    }),
  };

  static override readonly examples = [
    '<%= config.bin %> navigator alerts --limit 50 --json',
    '<%= config.bin %> navigator alerts --category lead --sort relevance --exclude-suggested',
    '<%= config.bin %> navigator alerts --since 2026-10-01T00:00:00Z',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(NavigatorAlerts);
    const {
      limit,
      sort,
      category,
      types,
      since,
      'exclude-suggested': excludeSuggested,
      quiet,
      json,
      fields,
    } = flags;
    const client = await this.buildAuthenticatedClient();
    const params = {
      limit,
      sort: sort as TNvRetrieveAlertsParams['sort'],
      filter: {
        category: category as 'lead' | 'account' | undefined,
        types: types
          ?.split(',')
          .map((type): string => type.trim())
          .filter(Boolean),
        since,
        excludeSuggested,
      },
    } satisfies TNvRetrieveAlertsParams;

    try {
      const { data, errors } = await runWorkflow(client.nvRetrieveAlerts, params, {
        isQuiet: quiet,
      });
      formatOutput({
        data,
        errors,
        isJson: json,
        fields,
        isQuiet: quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import type { TNvRetrieveAlertsParams } from '@linkedapi/node';
import { Flags } from '@oclif/core';
import { isNvAlertSubject } from '@utils/is-nv-alert-subject';
import { splitListFlag } from '@utils/split-list-flag';

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
      description:
        'Exact machine codes (comma-separated or a JSON array); empty means unrestricted',
    }),
    'list-id': Flags.string({
      description: 'Owned list ID; requires latest sorting',
    }),
    subject: Flags.string({
      description:
        'Recognised hashed URL or Sales Navigator subject URN; repeat once per subject, never use a comma list or JSON array',
      multiple: true,
      multipleNonGreedy: true,
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
    if (flags.subject?.some((subject): boolean => !isNvAlertSubject(subject))) {
      this.error(
        'Each --subject must be one recognised hashed LinkedIn URL or Sales Navigator subject URN. Repeat --subject for multiple identities; do not use a JSON array or comma-separated list.',
        { exit: EXIT_CODE.VALIDATION },
      );
    }
    if (flags['list-id'] && sort === 'relevance') {
      this.error('--list-id requires --sort latest.', { exit: EXIT_CODE.VALIDATION });
    }
    const client = await this.buildAuthenticatedClient();
    const params = {
      limit,
      sort: sort as TNvRetrieveAlertsParams['sort'],
      filter: {
        category: category as 'lead' | 'account' | undefined,
        listId: flags['list-id'],
        subjects: flags.subject,
        types: types === undefined ? undefined : splitListFlag(types).filter(Boolean),
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

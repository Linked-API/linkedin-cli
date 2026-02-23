import { Args, Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class CompanyFetch extends BaseCommand {
  static override description = 'Fetch a LinkedIn company profile';

  static override args = {
    url: Args.string({
      description: 'LinkedIn company URL',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    employees: Flags.boolean({
      description: 'Include employee data',
      default: false,
    }),
    dms: Flags.boolean({
      description: 'Include decision makers',
      default: false,
    }),
    posts: Flags.boolean({
      description: 'Include company posts',
      default: false,
    }),
    'employees-limit': Flags.integer({
      description: 'Max employees to retrieve',
    }),
    'employees-first-name': Flags.string({
      description: 'Filter employees by first name',
    }),
    'employees-last-name': Flags.string({
      description: 'Filter employees by last name',
    }),
    'employees-position': Flags.string({
      description: 'Filter employees by position',
    }),
    'employees-locations': Flags.string({
      description: 'Filter employees by locations (comma-separated)',
    }),
    'employees-industries': Flags.string({
      description: 'Filter employees by industries (comma-separated)',
    }),
    'employees-schools': Flags.string({
      description: 'Filter employees by schools (comma-separated)',
    }),
    'dms-limit': Flags.integer({
      description: 'Max decision makers to retrieve',
    }),
    'posts-limit': Flags.integer({
      description: 'Max posts to retrieve',
    }),
    'posts-since': Flags.string({
      description: 'Retrieve posts since ISO timestamp',
    }),
  };

  static override examples = [
    '<%= config.bin %> company fetch https://www.linkedin.com/company/microsoft',
    '<%= config.bin %> company fetch https://www.linkedin.com/company/google --employees --dms --json',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CompanyFetch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      companyUrl: args.url,
    };

    if (flags.employees) params.retrieveEmployees = true;
    if (flags.dms) params.retrieveDMs = true;
    if (flags.posts) params.retrievePosts = true;

    if (flags.employees) {
      const config: Record<string, unknown> = {};
      if (flags['employees-limit']) config.limit = flags['employees-limit'];

      const filter: Record<string, unknown> = {};
      if (flags['employees-first-name']) filter.firstName = flags['employees-first-name'];
      if (flags['employees-last-name']) filter.lastName = flags['employees-last-name'];
      if (flags['employees-position']) filter.position = flags['employees-position'];
      if (flags['employees-locations'])
        filter.locations = flags['employees-locations'].split(',').map((s) => s.trim());
      if (flags['employees-industries'])
        filter.industries = flags['employees-industries'].split(',').map((s) => s.trim());
      if (flags['employees-schools'])
        filter.schools = flags['employees-schools'].split(',').map((s) => s.trim());

      if (Object.keys(filter).length > 0) config.filter = filter;
      if (Object.keys(config).length > 0) params.employeesRetrievalConfig = config;
    }

    if (flags.dms && flags['dms-limit']) {
      params.dmsRetrievalConfig = {
        limit: flags['dms-limit'],
      };
    }

    if (flags.posts && (flags['posts-limit'] || flags['posts-since'])) {
      const config: Record<string, unknown> = {};
      if (flags['posts-limit']) config.limit = flags['posts-limit'];
      if (flags['posts-since']) config.since = flags['posts-since'];
      params.postsRetrievalConfig = config;
    }

    try {
      const result = await runWorkflow(client.fetchCompany, params as any, {
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

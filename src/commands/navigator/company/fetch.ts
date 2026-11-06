import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';
import { splitListFlag } from '@utils/split-list-flag';

export default class NavigatorCompanyFetch extends BaseCommand {
  static override description = 'Fetch a company profile via Sales Navigator';

  static override args = {
    'hashed-url': Args.string({
      description: 'Public or hashed LinkedIn company URL (/company/... or /sales/company/...)',
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
    'employees-limit': Flags.integer({
      description: 'Max employees to retrieve',
    }),
    'employees-first-name': Flags.string({
      description: 'Filter employees by first name',
    }),
    'employees-last-name': Flags.string({
      description: 'Filter employees by last name',
    }),
    'employees-positions': Flags.string({
      description:
        'Filter employees by positions (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'employees-locations': Flags.string({
      description:
        'Filter employees by locations (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'employees-industries': Flags.string({
      description:
        'Filter employees by industries (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'employees-schools': Flags.string({
      description:
        'Filter employees by schools (comma-separated, or a JSON array if a value contains a comma)',
    }),
    'employees-years-of-experience': Flags.string({
      description: 'Filter employees by experience ranges (comma-separated)',
    }),
    'employees-connection-degrees': Flags.string({
      description:
        'Filter employees by your connection degree (comma-separated: 1st,2nd,3rd+,groupMembers)',
    }),
    'dms-limit': Flags.integer({
      description: 'Max decision makers to retrieve',
    }),
  };

  static override examples = [
    '<%= config.bin %> navigator company fetch https://www.linkedin.com/sales/company/1035 --employees --dms',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NavigatorCompanyFetch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {
      companyHashedUrl: args['hashed-url'],
    };

    if (flags.employees) params.retrieveEmployees = true;
    if (flags.dms) params.retrieveDMs = true;

    if (flags.employees) {
      const config: Record<string, unknown> = {};
      if (flags['employees-limit']) config.limit = flags['employees-limit'];

      const filter: Record<string, unknown> = {};
      if (flags['employees-first-name']) filter.firstName = flags['employees-first-name'];
      if (flags['employees-last-name']) filter.lastName = flags['employees-last-name'];
      if (flags['employees-positions'])
        filter.positions = splitListFlag(flags['employees-positions']);
      if (flags['employees-locations'])
        filter.locations = splitListFlag(flags['employees-locations']);
      if (flags['employees-industries'])
        filter.industries = splitListFlag(flags['employees-industries']);
      if (flags['employees-schools']) filter.schools = splitListFlag(flags['employees-schools']);
      if (flags['employees-years-of-experience'])
        filter.yearsOfExperiences = splitListFlag(flags['employees-years-of-experience']);
      if (flags['employees-connection-degrees'])
        filter.connectionDegrees = splitListFlag(flags['employees-connection-degrees']);

      if (Object.keys(filter).length > 0) config.filter = filter;
      if (Object.keys(config).length > 0) params.employeesRetrievalConfig = config;
    }

    if (flags.dms && flags['dms-limit']) {
      params.dmsRetrievalConfig = {
        limit: flags['dms-limit'],
      };
    }

    try {
      const result = await runWorkflow(client.nvFetchCompany, params, {
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

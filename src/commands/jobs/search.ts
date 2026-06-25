import { Flags } from '@oclif/core';

import { BaseCommand } from '@base-command';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';

export default class JobsSearch extends BaseCommand {
  static override description = 'Search for jobs on LinkedIn';

  static override flags = {
    ...BaseCommand.baseFlags,
    term: Flags.string({
      description: 'Search keyword or phrase',
    }),
    limit: Flags.integer({
      description: 'Max results to return',
    }),
    location: Flags.string({
      description: 'Filter by location',
    }),
    'date-posted': Flags.string({
      description: 'Filter by date posted',
      options: ['anyTime', 'past24Hours', 'pastWeek', 'pastMonth'],
    }),
    'experience-levels': Flags.string({
      description:
        'Filter by experience levels (comma-separated: internship, entryLevel, associate, midSeniorLevel, director, executive)',
    }),
    'employment-types': Flags.string({
      description:
        'Filter by employment types (comma-separated: fullTime, partTime, contract, temporary, volunteer, internship, other)',
    }),
    'workplace-types': Flags.string({
      description: 'Filter by workplace types (comma-separated: onSite, remote, hybrid)',
    }),
    companies: Flags.string({
      description: 'Filter by company names (comma-separated)',
    }),
    industries: Flags.string({
      description: 'Filter by industries (comma-separated)',
    }),
    'job-functions': Flags.string({
      description: 'Filter by job functions (comma-separated)',
    }),
    'easy-apply': Flags.boolean({
      description: 'Only jobs with Easy Apply',
      default: false,
    }),
    'has-verifications': Flags.boolean({
      description: 'Only jobs with verification signals',
      default: false,
    }),
    'under-10-applicants': Flags.boolean({
      description: 'Only jobs with fewer than 10 applicants',
      default: false,
    }),
    'in-your-network': Flags.boolean({
      description: 'Only jobs from your network',
      default: false,
    }),
    'fair-chance-employer': Flags.boolean({
      description: 'Only fair chance employer jobs',
      default: false,
    }),
  };

  static override examples = [
    '<%= config.bin %> jobs search --term "product manager" --location "San Francisco" --limit 20',
    '<%= config.bin %> jobs search --term engineer --workplace-types "remote,hybrid" --easy-apply --json',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(JobsSearch);

    const client = await this.buildAuthenticatedClient();

    const params: Record<string, unknown> = {};
    if (flags.term) params.term = flags.term;
    if (flags.limit) params.limit = flags.limit;

    const filter: Record<string, unknown> = {};
    if (flags.location) filter.location = flags.location;
    if (flags['date-posted']) filter.datePosted = flags['date-posted'];
    if (flags['experience-levels'])
      filter.experienceLevels = splitCsv(flags['experience-levels']);
    if (flags['employment-types']) filter.employmentTypes = splitCsv(flags['employment-types']);
    if (flags['workplace-types']) filter.workplaceTypes = splitCsv(flags['workplace-types']);
    if (flags.companies) filter.companies = splitCsv(flags.companies);
    if (flags.industries) filter.industries = splitCsv(flags.industries);
    if (flags['job-functions']) filter.jobFunctions = splitCsv(flags['job-functions']);
    if (flags['easy-apply']) filter.easyApply = true;
    if (flags['has-verifications']) filter.hasVerifications = true;
    if (flags['under-10-applicants']) filter.under10Applicants = true;
    if (flags['in-your-network']) filter.inYourNetwork = true;
    if (flags['fair-chance-employer']) filter.fairChanceEmployer = true;

    if (Object.keys(filter).length > 0) {
      params.filter = filter;
    }

    try {
      const result = await runWorkflow(client.searchJobs, params, {
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

function splitCsv(value: string): Array<string> {
  return value.split(',').map((s) => s.trim());
}

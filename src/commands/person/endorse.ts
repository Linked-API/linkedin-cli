import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { formatOutput, formatVoidOutput } from '@core/output/formatter';
import { runVoidWorkflow, runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';
import { isStdoutTty } from '@utils/tty';

export default class PersonEndorse extends BaseCommand {
  static override description =
    "Endorse skills of a 1st-degree connection, using names in the profile owner's language. Already-endorsed skills count as success. Each success counts toward the stEndorsements limit.";

  static override args = {
    url: Args.string({
      description: 'LinkedIn profile URL of your 1st-degree connection',
      required: true,
    }),
  };

  static override flags = {
    ...BaseCommand.baseFlags,
    skill: Flags.string({
      description: 'Exact skill name (case and extra spaces are ignored)',
    }),
    pattern: Flags.string({
      description:
        'RE2 pattern, case-insensitive, matching anywhere; use ^…$ for a whole name (repeatable, 1-20 patterns of 1-200 characters)',
      multiple: true,
      multipleNonGreedy: true,
    }),
    all: Flags.boolean({
      description: 'Endorse all skills',
      default: false,
    }),
  };

  static override examples = [
    '<%= config.bin %> person endorse https://www.linkedin.com/in/john-doe --skill "Project Management"',
    '<%= config.bin %> person endorse https://www.linkedin.com/in/john-doe --pattern manage --pattern "^scrum$"',
    '<%= config.bin %> person endorse https://www.linkedin.com/in/john-doe --all',
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PersonEndorse);
    const selectionCount = [
      flags.skill !== undefined,
      flags.pattern !== undefined,
      flags.all,
    ].filter(Boolean).length;

    if (selectionCount !== 1) {
      this.error('Provide exactly one of --skill, --pattern or --all.', {
        exit: EXIT_CODE.VALIDATION,
      });
    }

    const client = await this.buildAuthenticatedClient();

    try {
      if (flags.skill !== undefined) {
        const result = await runVoidWorkflow(
          client.endorsePersonSkill,
          { personUrl: args.url, skillName: flags.skill },
          { isQuiet: flags.quiet },
        );

        formatVoidOutput({
          errors: result.errors,
          isJson: flags.json,
          isQuiet: flags.quiet,
          successMessage: `Endorsed: ${flags.skill}`,
        });
        return;
      }

      const result = await runWorkflow(
        client.endorsePersonSkills,
        {
          personUrl: args.url,
          ...(flags.pattern !== undefined ? { skillNamePatterns: flags.pattern } : {}),
        },
        { isQuiet: flags.quiet },
      );

      const data =
        flags.json || !isStdoutTty() || flags.fields !== undefined
          ? result.data
          : result.data?.map(({ skillName, success, error }) =>
              success ? `Endorsed: ${skillName}` : `Not endorsed: ${skillName} - ${error?.type}`,
            );

      formatOutput({
        data,
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

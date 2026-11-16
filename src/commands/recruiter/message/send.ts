import { BaseCommand } from '@base-command';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { resolveMessagePositionals } from '@core/messaging/resolve-message-positionals';
import { formatOutput } from '@core/output/formatter';
import { runWorkflow } from '@core/workflow/workflow-runner';
import { Args, Flags } from '@oclif/core';

export default class RecruiterMessageSend extends BaseCommand {
  static override readonly description =
    "Requires a LinkedIn Recruiter Lite seat and Linked API's Plus plan. New InMail requires personUrl, subject (1\u2013200 characters, one line) and text (1\u20131900 characters). Reply with threadId and text only, without personUrl or subject. A paid InMail credit is spent only when allowPaidCredit is true. After an unexpectedError, check the conversation before sending again. Turn on --allow-paid-credit only when the user has explicitly approved spending a paid InMail credit on this message; on inMailCreditRequired, ask the user instead of retrying with --allow-paid-credit on.";
  static override readonly args = {
    'person-url': Args.string({
      required: false,
      description: 'Recruiter profile URL; omit with --thread-id',
    }),
    text: Args.string({ required: false, description: 'Required message text, 1–1900 characters' }),
  };
  static override readonly flags = {
    ...BaseCommand.baseFlags,
    subject: Flags.string({
      description:
        'Required for new InMail: 1–200 characters, one line; forbidden with --thread-id',
    }),
    'thread-id': Flags.string({ description: 'Reply thread instead of a person URL; no subject' }),
    'allow-paid-credit': Flags.boolean({
      default: false,
      description:
        'A paid InMail credit is spent only when this is true. Turn on --allow-paid-credit only when the user has explicitly approved spending a paid InMail credit on this message; on inMailCreditRequired, ask the user instead of retrying with --allow-paid-credit on.',
    }),
  };
  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RecruiterMessageSend);
    const { personUrl, text } = resolveMessagePositionals({
      personUrlArg: args['person-url'],
      textArg: args.text,
      hasThreadId: flags['thread-id'] !== undefined,
    });
    const threadId = flags['thread-id'];
    if (
      !text ||
      (threadId !== undefined && threadId.trim() === '') ||
      (threadId !== undefined && (personUrl !== undefined || flags.subject !== undefined)) ||
      (threadId === undefined && (!personUrl || !flags.subject))
    )
      this.error(
        'Provide person-url, text and --subject, or --thread-id and text without person-url or --subject.',
        { exit: EXIT_CODE.VALIDATION },
      );
    const params = {
      text,
      allowPaidCredit: flags['allow-paid-credit'],
      ...(threadId === undefined ? { personUrl, subject: flags.subject } : { threadId }),
    };
    const client = await this.buildAuthenticatedClient();
    try {
      const result = await runWorkflow(client.rcSendMessage, params, { isQuiet: flags.quiet });
      formatOutput({
        data: result.data,
        errors: result.errors,
        fields: flags.fields,
        isJson: flags.json,
        isQuiet: flags.quiet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

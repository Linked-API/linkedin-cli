import { TMessagePositionals } from '@core/messaging/types/message-positionals.type';

interface TResolveMessagePositionalsOptions {
  personUrlArg: string | undefined;
  textArg: string | undefined;
  hasThreadId: boolean;
}

/**
 * Splits the two message positionals into a recipient and a message body.
 *
 * oclif rejects any argument spec where a required argument follows an optional one, so both
 * positionals are declared optional and the real contract is enforced here: when --thread-id
 * supplies the recipient, a lone positional is the message text rather than a profile URL.
 */
export function resolveMessagePositionals(
  options: TResolveMessagePositionalsOptions,
): TMessagePositionals {
  const { personUrlArg, textArg, hasThreadId } = options;

  if (textArg !== undefined) {
    return { personUrl: personUrlArg, text: textArg };
  }

  if (hasThreadId) {
    return { personUrl: undefined, text: personUrlArg };
  }

  return { personUrl: personUrlArg, text: undefined };
}

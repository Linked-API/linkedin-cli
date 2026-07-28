interface TMessageArgs {
  'person-url'?: string;
  text?: string;
}

interface TMessagePositionals {
  personUrl?: string;
  text?: string;
}

/**
 * oclif requires every optional arg to be declared after the required ones, so `text` cannot be
 * declared as required while `person-url` stays optional for the --thread-id form. Both are declared
 * optional and bound here instead: with --thread-id and a single positional, that positional is the
 * message text, not a recipient.
 */
export function resolveMessagePositionals(
  args: TMessageArgs,
  threadId?: string,
): TMessagePositionals {
  const personUrl = args['person-url'];

  if (threadId && args.text === undefined) {
    return {
      personUrl: undefined,
      text: personUrl,
    };
  }

  return {
    personUrl,
    text: args.text,
  };
}

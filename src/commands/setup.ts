import { Command, Flags } from '@oclif/core';

import { addAccount } from '@core/auth/config-store';
import { buildClient } from '@core/client/build-client';
import { EXIT_CODE } from '@core/errors/exit-codes';
import { isStdinTty } from '@utils/tty';

export default class Setup extends Command {
  static override description = 'Save Linked API tokens for authentication';

  static override flags = {
    'linked-api-token': Flags.string({
      description: 'Linked API Token (for non-interactive use)',
    }),
    'identification-token': Flags.string({
      description: 'Identification Token (for non-interactive use)',
    }),
  };

  static override examples = [
    '<%= config.bin %> setup',
    '<%= config.bin %> setup --linked-api-token=xxx --identification-token=yyy',
  ];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Setup);

    let linkedApiToken: string;
    let identificationToken: string;

    if (flags['linked-api-token'] && flags['identification-token']) {
      linkedApiToken = flags['linked-api-token'];
      identificationToken = flags['identification-token'];
    } else if (!isStdinTty()) {
      process.stderr.write(`Cannot run interactive setup in non-interactive mode.
Use flags instead:

  linkedin setup --linked-api-token=xxx --identification-token=yyy

Get tokens at https://app.linkedapi.io\n`);
      this.exit(EXIT_CODE.AUTH);
      return;
    } else {
      process.stdout.write(
        'To get your tokens, visit: https://app.linkedapi.io\n' +
          '(If you don\'t have an account yet, create one and connect your LinkedIn profile first)\n\n',
      );

      linkedApiToken = await readMaskedInput('Linked API Token: ', 'account_');
      identificationToken = await readMaskedInput('Identification Token: ', 'id_');
    }

    if (!linkedApiToken || !identificationToken) {
      process.stderr.write('Both tokens are required.\n');
      this.exit(EXIT_CODE.AUTH);
      return;
    }

    process.stdout.write('Verifying tokens... ');

    let accountName = '';

    try {
      const tempClient = buildClient({ linkedApiToken, identificationToken });
      const accountInfo = await tempClient.getAccountInfo();
      accountName = accountInfo.data?.name ?? '';
      process.stdout.write('OK\n');
    } catch {
      process.stdout.write('FAILED\n');
      process.stderr.write(
        '\nInvalid tokens. Make sure you copied the correct tokens from https://app.linkedapi.io\n' +
          'Need help? Visit https://linkedapi.io/docs/making-requests\n',
      );
      this.exit(EXIT_CODE.AUTH);
      return;
    }

    const displayName = accountName || 'default';

    addAccount({
      name: displayName,
      linkedApiToken,
      identificationToken,
    });

    process.stdout.write(`Account "${displayName}" saved and set as active.\n`);
  }
}

function readMaskedInput(prompt: string, visiblePrefix: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf-8');

    let input = '';

    const onData = (str: string): void => {
      for (const char of str) {
        if (char === '\n' || char === '\r') {
          stdin.setRawMode(false);
          stdin.removeListener('data', onData);
          stdin.pause();
          process.stdout.write('\n');
          resolve(input);
          return;
        } else if (char === '\u007F' || char === '\b') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else if (char === '\u0003') {
          stdin.setRawMode(false);
          process.stdout.write('\n');
          process.exit(0);
        } else if (char >= ' ') {
          input += char;
          const isInPrefix = input.length <= visiblePrefix.length && visiblePrefix.startsWith(input);
          process.stdout.write(isInPrefix ? char : '*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

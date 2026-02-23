import { Command, Flags } from '@oclif/core';
import LinkedApi, { LinkedApiError } from '@linkedapi/node';

import { resolveAuthTokens } from '@core/auth/auth-manager';
import { buildClient } from '@core/client/build-client';
import { mapLinkedApiErrorToCliError, writeErrorToStderr } from '@core/errors/error-handler';
import { EXIT_CODE } from '@core/errors/exit-codes';

export abstract class BaseCommand extends Command {
  static override baseFlags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    fields: Flags.string({
      description: 'Comma-separated list of fields to include in output',
    }),
    quiet: Flags.boolean({
      char: 'q',
      description: 'Suppress progress output on stderr',
      default: false,
    }),
    'no-color': Flags.boolean({
      description: 'Disable colored output',
      default: false,
    }),
    account: Flags.string({
      description: 'Account name to use (when multiple accounts are configured)',
    }),
  };

  public override async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse(this.constructor as typeof BaseCommand);

    if (flags['no-color']) {
      process.env.NO_COLOR = '1';
    }
  }

  protected async buildAuthenticatedClient(): Promise<LinkedApi> {
    try {
      const { flags } = await this.parse(this.constructor as typeof BaseCommand);
      const tokens = resolveAuthTokens(flags.account);
      return buildClient(tokens);
    } catch (error) {
      if (error instanceof Error) {
        process.stderr.write(error.message + '\n');
      }

      this.exit(EXIT_CODE.AUTH);
      throw error;
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof LinkedApiError) {
      const cliError = mapLinkedApiErrorToCliError(error);
      writeErrorToStderr(cliError);
      this.exit(cliError.exitCode);
    }

    if (error instanceof Error) {
      writeErrorToStderr({
        exitCode: EXIT_CODE.GENERAL,
        error: 'unexpectedError',
        message: error.message,
      });
      this.exit(EXIT_CODE.GENERAL);
    }

    writeErrorToStderr({
      exitCode: EXIT_CODE.GENERAL,
      error: 'unexpectedError',
      message: 'An unexpected error occurred',
    });
    this.exit(EXIT_CODE.GENERAL);

    throw error;
  }
}

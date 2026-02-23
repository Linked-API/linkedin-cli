import { findAccountByName, readConfig } from './config-store';

interface TAuthTokens {
  linkedApiToken: string;
  identificationToken: string;
}

const NO_TOKENS_MESSAGE = `Authentication required.

To use this CLI, you need a Linked API account with a connected LinkedIn profile.

  1. Create an account at https://app.linkedapi.io
  2. Connect your LinkedIn account on the platform
  3. Copy your Linked API Token and Identification Token from the dashboard
  4. Run: linkedin setup

Learn more: https://linkedapi.io/docs/getting-started`;

export function resolveAuthTokens(accountOverride?: string): TAuthTokens {
  if (accountOverride) {
    const account = findAccountByName(accountOverride);

    if (!account) {
      throw new Error(`Account "${accountOverride}" not found. Run "linkedin account list" to see available accounts.`);
    }

    return {
      linkedApiToken: account.linkedApiToken,
      identificationToken: account.identificationToken,
    };
  }

  const config = readConfig();

  if (config) {
    return {
      linkedApiToken: config.linkedApiToken,
      identificationToken: config.identificationToken,
    };
  }

  throw new Error(NO_TOKENS_MESSAGE);
}

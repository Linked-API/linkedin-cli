import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

interface TAccountEntry {
  name: string;
  linkedApiToken: string;
  identificationToken: string;
}

interface TMultiAccountConfig {
  accounts: Array<TAccountEntry>;
  currentAccount: string;
}

interface TLegacyConfig {
  linkedApiToken: string;
  identificationToken: string;
}

function getConfigDir(): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME;

  if (xdgConfig) {
    return path.join(xdgConfig, 'linkedin-cli');
  }

  return path.join(os.homedir(), '.config', 'linkedin-cli');
}

function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

function readRawConfig(): TMultiAccountConfig | undefined {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return undefined;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as TMultiAccountConfig | TLegacyConfig;

    // Auto-migrate legacy format
    if ('linkedApiToken' in parsed && !('accounts' in parsed)) {
      const legacy = parsed as TLegacyConfig;
      const migrated: TMultiAccountConfig = {
        accounts: [
          {
            name: 'default',
            linkedApiToken: legacy.linkedApiToken,
            identificationToken: legacy.identificationToken,
          },
        ],
        currentAccount: legacy.identificationToken,
      };
      saveRawConfig(migrated);
      return migrated;
    }

    const multi = parsed as TMultiAccountConfig;

    if (multi.accounts && multi.accounts.length > 0) {
      return multi;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function saveRawConfig(config: TMultiAccountConfig): void {
  const configDir = getConfigDir();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, {
      recursive: true,
    });
  }

  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

export function readConfig(): { linkedApiToken: string; identificationToken: string } | undefined {
  const config = readRawConfig();

  if (!config) {
    return undefined;
  }

  const current = config.accounts.find(
    (account) => account.identificationToken === config.currentAccount,
  );

  if (!current) {
    // Fallback to first account
    const first = config.accounts[0];

    if (!first) {
      return undefined;
    }

    return {
      linkedApiToken: first.linkedApiToken,
      identificationToken: first.identificationToken,
    };
  }

  return {
    linkedApiToken: current.linkedApiToken,
    identificationToken: current.identificationToken,
  };
}

export function addAccount(account: TAccountEntry): void {
  const config = readRawConfig() ?? { accounts: [], currentAccount: '' };

  const existingIndex = config.accounts.findIndex(
    (existing) => existing.identificationToken === account.identificationToken,
  );

  if (existingIndex >= 0) {
    config.accounts[existingIndex] = account;
  } else {
    config.accounts.push(account);
  }

  config.currentAccount = account.identificationToken;
  saveRawConfig(config);
}

export function removeCurrentAccount(): TAccountEntry | undefined {
  const config = readRawConfig();

  if (!config) {
    return undefined;
  }

  const currentIndex = config.accounts.findIndex(
    (account) => account.identificationToken === config.currentAccount,
  );

  if (currentIndex < 0) {
    return undefined;
  }

  const removed = config.accounts.splice(currentIndex, 1)[0];

  if (config.accounts.length > 0) {
    config.currentAccount = config.accounts[0]!.identificationToken;
  } else {
    config.currentAccount = '';
  }

  saveRawConfig(config);
  return removed;
}

export function removeAllAccounts(): number {
  const config = readRawConfig();

  if (!config) {
    return 0;
  }

  const count = config.accounts.length;
  saveRawConfig({ accounts: [], currentAccount: '' });
  return count;
}

export function listAccounts(): Array<TAccountEntry & { isCurrent: boolean }> {
  const config = readRawConfig();

  if (!config) {
    return [];
  }

  return config.accounts.map((account) => ({
    ...account,
    isCurrent: account.identificationToken === config.currentAccount,
  }));
}

export function setCurrentAccount(identificationToken: string): boolean {
  const config = readRawConfig();

  if (!config) {
    return false;
  }

  const account = config.accounts.find(
    (account) => account.identificationToken === identificationToken,
  );

  if (!account) {
    return false;
  }

  config.currentAccount = identificationToken;
  saveRawConfig(config);
  return true;
}

export function findAccountByName(nameQuery: string): TAccountEntry | undefined {
  const config = readRawConfig();

  if (!config) {
    return undefined;
  }

  const lowerQuery = nameQuery.toLowerCase();

  return config.accounts.find((account) => account.name.toLowerCase().includes(lowerQuery));
}

export function renameAccount(identificationToken: string, newName: string): boolean {
  const config = readRawConfig();

  if (!config) {
    return false;
  }

  const account = config.accounts.find(
    (account) => account.identificationToken === identificationToken,
  );

  if (!account) {
    return false;
  }

  account.name = newName;
  saveRawConfig(config);
  return true;
}

export function deleteConfig(): boolean {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return false;
  }

  fs.unlinkSync(configPath);
  return true;
}

export function getConfigFilePath(): string {
  return getConfigPath();
}

const DEFAULT_CLIENT = 'cli';

export function resolveClient(): string {
  const overrideClient = process.env.LINKEDAPI_CLIENT?.trim();

  return overrideClient && overrideClient.length > 0 ? overrideClient : DEFAULT_CLIENT;
}

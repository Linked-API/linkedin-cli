export const EXIT_CODE = {
  SUCCESS: 0,
  GENERAL: 1,
  AUTH: 2,
  SUBSCRIPTION: 3,
  ACCOUNT: 4,
  VALIDATION: 5,
  RATE_LIMIT: 6,
  NETWORK: 7,
  TIMEOUT: 8,
} as const;

export type TExitCode = (typeof EXIT_CODE)[keyof typeof EXIT_CODE];

import { LinkedApiError, LinkedApiWorkflowTimeoutError } from 'linkedapi-node';

import { EXIT_CODE, TExitCode } from './exit-codes';

interface TCliError {
  exitCode: TExitCode;
  error: string;
  message: string;
  workflowId?: string;
}

export function mapLinkedApiErrorToCliError(error: LinkedApiError): TCliError {
  if (error instanceof LinkedApiWorkflowTimeoutError) {
    return {
      exitCode: EXIT_CODE.TIMEOUT,
      error: 'workflowTimeout',
      message: `Workflow timed out. Use 'linkedin workflow status ${error.workflowId} --wait' to continue polling.`,
      workflowId: error.workflowId,
    };
  }

  switch (error.type) {
    case 'linkedApiTokenRequired':
    case 'invalidLinkedApiToken':
    case 'identificationTokenRequired':
    case 'invalidIdentificationToken':
      return {
        exitCode: EXIT_CODE.AUTH,
        error: error.type,
        message: error.message,
      };

    case 'subscriptionRequired':
    case 'plusPlanRequired':
      return {
        exitCode: EXIT_CODE.SUBSCRIPTION,
        error: error.type,
        message: error.message,
      };

    case 'linkedinAccountSignedOut':
    case 'languageNotSupported':
      return {
        exitCode: EXIT_CODE.ACCOUNT,
        error: error.type,
        message: error.message,
      };

    case 'invalidRequestPayload':
    case 'invalidWorkflow':
      return {
        exitCode: EXIT_CODE.VALIDATION,
        error: error.type,
        message: error.message,
      };

    case 'httpError':
      return {
        exitCode: EXIT_CODE.NETWORK,
        error: error.type,
        message: error.message,
      };

    default:
      return {
        exitCode: EXIT_CODE.GENERAL,
        error: error.type,
        message: error.message,
      };
  }
}

export function writeErrorToStderr(cliError: TCliError): void {
  const output: Record<string, unknown> = {
    error: cliError.error,
    message: cliError.message,
  };

  if (cliError.workflowId) {
    output.workflowId = cliError.workflowId;
  }

  process.stderr.write(JSON.stringify(output) + '\n');
}

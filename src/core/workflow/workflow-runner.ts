import type { Operation, TMappedResponse } from '@linkedapi/node';

import { workflowDetails } from './workflow-details';

interface TWorkflowRunnerOptions {
  isQuiet: boolean;
}

export async function runWorkflow<TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation: Operation<any, TResult>,
  params: Record<string, unknown>,
  options: TWorkflowRunnerOptions,
): Promise<TMappedResponse<TResult>> {
  if (!options.isQuiet) {
    process.stderr.write('Executing...\n');
  }

  const workflow = await workflowDetails.executeWorkflowWithDetails(operation, params);
  const { workflowId, workflowStatus, message } = workflow;

  if (!options.isQuiet) {
    process.stderr.write(`Workflow started: ${workflowId}\n`);
    process.stderr.write(`Status: ${workflowStatus}\n`);
    if (message) {
      process.stderr.write(`${message}\n`);
    }
    process.stderr.write('Waiting for result...\n');
  }

  const result = await operation.result(workflowId);

  if (!options.isQuiet) {
    process.stderr.write('Done.\n');
  }

  return result;
}

export async function runVoidWorkflow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation: Operation<any, unknown>,
  params: Record<string, unknown>,
  options: TWorkflowRunnerOptions,
): Promise<TMappedResponse<unknown>> {
  return runWorkflow(operation, params, options);
}

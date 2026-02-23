import type { Operation, TMappedResponse } from 'linkedapi-node';

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

  const workflowId = await operation.execute(params);

  if (!options.isQuiet) {
    process.stderr.write(`Workflow started: ${workflowId}\n`);
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

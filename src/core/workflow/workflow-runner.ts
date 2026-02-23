import type { Operation, TMappedResponse } from 'linkedapi-node';

interface TWorkflowRunnerOptions {
  isQuiet: boolean;
}

export async function runWorkflow<TParams, TResult>(
  operation: Operation<TParams, TResult>,
  params: TParams,
  options: TWorkflowRunnerOptions,
): Promise<TMappedResponse<TResult>> {
  if (!options.isQuiet) {
    process.stderr.write('Executing...\n');
  }

  const workflowId = await (operation as Operation<unknown, TResult>).execute(params);

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

export async function runVoidWorkflow<TParams>(
  operation: Operation<TParams, unknown>,
  params: TParams,
  options: TWorkflowRunnerOptions,
): Promise<TMappedResponse<unknown>> {
  return runWorkflow(operation, params, options);
}

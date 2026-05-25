import type { Operation, TMappedResponse } from '@linkedapi/node';

import type { TWorkflowInProgressDetails } from './types/workflow-in-progress-details.type';
import type { TWorkflowInProgressStatus } from './types/workflow-in-progress-status.type';
import type { TWorkflowStartedDetails } from './types/workflow-started-details.type';

async function executeWorkflowWithDetails<TParams, TResult>(
  operation: Operation<TParams, TResult>,
  params: TParams,
): Promise<TWorkflowStartedDetails> {
  const workflow = await operation.execute(params);
  return {
    ...workflow,
    message: workflow.message || '',
  };
}

async function getWorkflowStatusDetails<TParams, TResult>(
  operation: Operation<TParams, TResult>,
  workflowId: string,
): Promise<TMappedResponse<TResult> | TWorkflowInProgressDetails> {
  const status = await operation.status(workflowId);
  if (isWorkflowInProgress(status)) {
    return {
      ...status,
      message: status.message || '',
    };
  }

  return status;
}

function isWorkflowInProgress(status: unknown): status is TWorkflowInProgressDetails {
  if (!status || typeof status !== 'object') {
    return false;
  }

  const { workflowStatus } = status as { workflowStatus?: unknown };
  return isWorkflowInProgressStatus(workflowStatus);
}

function isWorkflowInProgressStatus(status: unknown): status is TWorkflowInProgressStatus {
  return status === 'running' || status === 'pending';
}

export const workflowDetails = {
  executeWorkflowWithDetails,
  getWorkflowStatusDetails,
  isWorkflowInProgress,
} as const;

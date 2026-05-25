import type { TWorkflowInProgressStatus } from './workflow-in-progress-status.type';

export interface TWorkflowInProgressDetails {
  workflowStatus: TWorkflowInProgressStatus;
  message: string;
}

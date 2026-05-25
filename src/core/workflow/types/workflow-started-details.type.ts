import type { TWorkflowInProgressDetails } from './workflow-in-progress-details.type';

export interface TWorkflowStartedDetails extends TWorkflowInProgressDetails {
  workflowId: string;
}

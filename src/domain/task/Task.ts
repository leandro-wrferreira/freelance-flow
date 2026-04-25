export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  accumulatedTime: number;
  timerStartedAt: Date | null;
  files: string | null;
  createdAt: Date;
}

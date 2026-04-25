export interface TimeEntry {
  id: string;
  taskId: string;
  description: string | null;
  duration: number; // in seconds
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

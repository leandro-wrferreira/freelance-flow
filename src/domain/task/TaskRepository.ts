import { Task } from "./Task";
import { TimeEntry } from "./TimeEntry";

export interface TaskRepository {
  create(data: Pick<Task, "projectId" | "title" | "description" | "files">): Promise<Task>;
  update(id: string, data: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  createTimeEntry(data: { taskId: string, description: string | null, duration: number, startTime: Date, endTime: Date }): Promise<TimeEntry>;
  createAuditLog(data: { projectId: string, action: string, details: string }): Promise<void>;
  getTaskWithDetails(id: string): Promise<Task | null>;
  delete(id: string): Promise<void>;
}


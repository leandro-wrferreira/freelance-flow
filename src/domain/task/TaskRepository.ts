import { Task } from "./Task";

export interface TaskRepository {
  create(data: Pick<Task, "projectId" | "title" | "description" | "files">): Promise<Task>;
  update(id: string, data: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
}

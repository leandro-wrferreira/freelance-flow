import { Project } from "./Project";

export interface ProjectRepository {
  create(data: Omit<Project, "id" | "createdAt">): Promise<Project>;
  update(id: string, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project>;
  delete(id: string): Promise<void>;
  findByFolderId(folderId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
}

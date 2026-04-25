import { Project } from "./Project";

export interface ProjectRepository {
  create(data: Omit<Project, "id" | "createdAt">): Promise<Project>;
  findByFolderId(folderId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
}

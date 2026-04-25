import { ProjectRepository } from "@/src/domain/project/ProjectRepository";

export class ProjectUseCases {
  constructor(private projectRepo: ProjectRepository) {}

  async createProject(userId: string, folderId: string, name: string, hourlyRate: number | null, fixedPrice: number | null) {
    return this.projectRepo.create({ userId, folderId, name, hourlyRate, fixedPrice });
  }

  async getProjects(folderId: string) {
    return this.projectRepo.findByFolderId(folderId);
  }

  async getProject(projectId: string) {
    return this.projectRepo.findById(projectId);
  }
}

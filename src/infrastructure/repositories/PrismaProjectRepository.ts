import { prisma } from "@/src/infrastructure/database/prisma";
import { Project } from "@/src/domain/project/Project";
import { ProjectRepository } from "@/src/domain/project/ProjectRepository";

export class PrismaProjectRepository implements ProjectRepository {
  async create(data: Omit<Project, "id" | "createdAt">): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        folderId: data.folderId,
        userId: data.userId,
        hourlyRate: data.hourlyRate,
        fixedPrice: data.fixedPrice,
      },
    });
  }

  async findByFolderId(folderId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { folderId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
    });
  }
}

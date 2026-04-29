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

  async update(id: string, data: Partial<Omit<Project, "id" | "createdAt">>): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByFolderId(folderId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { folderId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
    });
  }
}

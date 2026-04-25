import { prisma } from "@/src/infrastructure/database/prisma";
import { Folder } from "@/src/domain/folder/Folder";
import { FolderRepository } from "@/src/domain/folder/FolderRepository";

export class PrismaFolderRepository implements FolderRepository {
  async create(data: Omit<Folder, "id" | "createdAt">): Promise<Folder> {
    return prisma.folder.create({
      data: {
        name: data.name,
        userId: data.userId,
      },
    });
  }

  async findByUserId(userId: string): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }
}

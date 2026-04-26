import { prisma } from "@/src/infrastructure/database/prisma";
import { Task } from "@/src/domain/task/Task";
import { TaskRepository } from "@/src/domain/task/TaskRepository";

export class PrismaTaskRepository implements TaskRepository {
  async create(data: Pick<Task, "projectId" | "title" | "description" | "files">): Promise<Task> {
    return prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        files: data.files,
        status: "todo",
        accumulatedTime: 0,
      },
    });
  }

  async update(id: string, data: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: data as any,
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
    });
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        timeEntries: true
      }
    }) as unknown as Task[];
  }

  async createTimeEntry(data: { taskId: string, description: string | null, duration: number, startTime: Date, endTime: Date }): Promise<any> {
    return prisma.timeEntry.create({
      data
    });
  }

  async createAuditLog(data: { projectId: string, action: string, details: string }): Promise<void> {
    await prisma.auditLog.create({
      data
    });
  }

  async getTaskWithDetails(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        timeEntries: {
          orderBy: { startTime: "desc" }
        }
      }
    }) as unknown as Task | null;
  }
}


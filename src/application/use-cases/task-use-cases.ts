import { TaskRepository } from "@/src/domain/task/TaskRepository";

export class TaskUseCases {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(projectId: string, title: string, description: string, files: string = "[]") {
    return this.taskRepo.create({ projectId, title, description, files });
  }

  async updateTaskStatus(taskId: string, status: string) {
    return this.taskRepo.update(taskId, { status });
  }

  async toggleTimer(taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    if (task.timerStartedAt) {
      // Stop timer
      const elapsedSeconds = Math.floor(
        (Date.now() - task.timerStartedAt.getTime()) / 1000
      );
      const totalAccumulated = task.accumulatedTime + elapsedSeconds;
      return this.taskRepo.update(taskId, {
        timerStartedAt: null,
        accumulatedTime: totalAccumulated,
      });
    } else {
      // Start timer
      return this.taskRepo.update(taskId, {
        timerStartedAt: new Date(),
      });
    }
  }

  async getTasks(projectId: string) {
    return this.taskRepo.findByProjectId(projectId);
  }
}

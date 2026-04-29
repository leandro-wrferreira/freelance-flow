import { TaskRepository } from "@/src/domain/task/TaskRepository";

export class TaskUseCases {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(projectId: string, title: string, description: string, files: string = "[]") {
    const task = await this.taskRepo.create({ projectId, title, description, files });
    await this.taskRepo.createAuditLog({
      projectId,
      action: "CREATE_TASK",
      details: `Task "${title}" created.`
    });
    return task;
  }

  async updateTaskStatus(taskId: string, status: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;
    
    await this.taskRepo.update(taskId, { status });
    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "MOVE_TASK",
      details: `Task "${task.title}" moved to ${status}.`
    });
  }

  async toggleTimer(taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    if (task.timerStartedAt) {
      // Pause timer
      const elapsedSeconds = Math.floor(
        (Date.now() - task.timerStartedAt.getTime()) / 1000
      );
      const totalAccumulated = task.accumulatedTime + elapsedSeconds;
      await this.taskRepo.update(taskId, {
        timerStartedAt: null,
        accumulatedTime: totalAccumulated,
      });
      await this.taskRepo.createAuditLog({
        projectId: task.projectId,
        action: "PAUSE_TIMER",
        details: `Timer paused on task "${task.title}".`
      });
    } else {
      // Start timer
      await this.taskRepo.update(taskId, {
        timerStartedAt: new Date(),
      });
      await this.taskRepo.createAuditLog({
        projectId: task.projectId,
        action: "START_TIMER",
        details: `Timer started on task "${task.title}".`
      });
    }
  }

  async finalizeTimer(taskId: string, description: string, startTime: Date) {
    const task = await this.taskRepo.findById(taskId);
    if (!task || !task.timerStartedAt) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - task.timerStartedAt.getTime()) / 1000);
    
    await this.taskRepo.createTimeEntry({
      taskId,
      description,
      duration,
      startTime: startTime || task.timerStartedAt,
      endTime
    });

    await this.taskRepo.update(taskId, {
      timerStartedAt: null,
      accumulatedTime: task.accumulatedTime + duration
    });

    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "FINALIZE_TIMER",
      details: `Timer finalized on task "${task.title}". Duration: ${duration}s.`
    });
  }

  async addManualTime(taskId: string, hours: number, minutes: number, date: Date) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const duration = (hours * 3600) + (minutes * 60);
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + duration * 1000);

    await this.taskRepo.createTimeEntry({
      taskId,
      description: "Added manually",
      duration,
      startTime,
      endTime
    });

    await this.taskRepo.update(taskId, {
      accumulatedTime: task.accumulatedTime + duration
    });

    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "ADD_MANUAL_TIME",
      details: `Manual time added to task "${task.title}": ${hours}h ${minutes}m.`
    });
  }

  async updateTask(taskId: string, title: string, description: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;
    
    await this.taskRepo.update(taskId, { title, description });
    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "UPDATE_TASK",
      details: `Task "${task.title}" updated.`
    });
  }

  async deleteTask(taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;
    
    await this.taskRepo.delete(taskId);
    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "DELETE_TASK",
      details: `Task "${task.title}" deleted (soft delete).`
    });
  }

  async getTasks(projectId: string) {
    return this.taskRepo.findByProjectId(projectId);
  }

  async getTaskWithDetails(taskId: string) {
    return this.taskRepo.getTaskWithDetails(taskId);
  }
}

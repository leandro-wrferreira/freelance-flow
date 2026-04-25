import { TaskRepository } from "@/src/domain/task/TaskRepository";

export class TaskUseCases {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(projectId: string, title: string, description: string, files: string = "[]") {
    const task = await this.taskRepo.create({ projectId, title, description, files });
    await this.taskRepo.createAuditLog({
      projectId,
      action: "CREATE_TASK",
      details: `Atividade "${title}" criada.`
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
      details: `Atividade "${task.title}" movida para ${status}.`
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
        details: `Timer pausado na atividade "${task.title}".`
      });
    } else {
      // Start timer
      await this.taskRepo.update(taskId, {
        timerStartedAt: new Date(),
      });
      await this.taskRepo.createAuditLog({
        projectId: task.projectId,
        action: "START_TIMER",
        details: `Timer iniciado na atividade "${task.title}".`
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
      details: `Timer finalizado na atividade "${task.title}". Duração: ${duration}s.`
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
      description: "Adicionado manualmente",
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
      details: `Tempo manual adicionado à atividade "${task.title}": ${hours}h ${minutes}m.`
    });
  }

  async updateTask(taskId: string, title: string, description: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;
    
    await this.taskRepo.update(taskId, { title, description });
    await this.taskRepo.createAuditLog({
      projectId: task.projectId,
      action: "UPDATE_TASK",
      details: `Atividade "${task.title}" atualizada.`
    });
  }

  async getTasks(projectId: string) {

    return this.taskRepo.findByProjectId(projectId);
  }

  async getTaskWithDetails(taskId: string) {
    return this.taskRepo.getTaskWithDetails(taskId);
  }
}


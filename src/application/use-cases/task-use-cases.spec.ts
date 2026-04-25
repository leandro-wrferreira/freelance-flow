import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TaskUseCases } from "./task-use-cases";
import { TaskRepository } from "@/src/domain/task/TaskRepository";
import { Task } from "@/src/domain/task/Task";

describe("TaskUseCases", () => {
  const mockTaskRepo: TaskRepository = {
    create: vi.fn(),
    update: vi.fn(),
    findById: vi.fn(),
    findByProjectId: vi.fn(),
  };

  const sut = new TaskUseCases(mockTaskRepo);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createTask", () => {
    it("should call repository create with correct data", async () => {
      const data = {
        projectId: "project-1",
        title: "Task 1",
        description: "Description",
        files: "[]",
      };
      
      await sut.createTask(data.projectId, data.title, data.description, data.files);

      expect(mockTaskRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe("updateTaskStatus", () => {
    it("should call repository update with correct data", async () => {
      const taskId = "task-1";
      const status = "COMPLETED";
      
      await sut.updateTaskStatus(taskId, status);

      expect(mockTaskRepo.update).toHaveBeenCalledWith(taskId, { status });
    });
  });

  describe("toggleTimer", () => {
    it("should start timer if it is not currently running", async () => {
      const taskId = "task-1";
      const now = new Date("2026-04-25T13:00:00Z");
      vi.setSystemTime(now);

      mockTaskRepo.findById.mockResolvedValueOnce({
        id: taskId,
        timerStartedAt: null,
      } as Task);

      await sut.toggleTimer(taskId);

      expect(mockTaskRepo.update).toHaveBeenCalledWith(taskId, {
        timerStartedAt: now,
      });
    });

    it("should stop timer and accumulate time if it is currently running", async () => {
      const taskId = "task-1";
      const startTime = new Date("2026-04-25T13:00:00Z");
      const stopTime = new Date("2026-04-25T13:00:10Z"); // 10 seconds later
      
      vi.setSystemTime(stopTime);

      mockTaskRepo.findById.mockResolvedValueOnce({
        id: taskId,
        timerStartedAt: startTime,
        accumulatedTime: 100,
      } as Task);

      await sut.toggleTimer(taskId);

      expect(mockTaskRepo.update).toHaveBeenCalledWith(taskId, {
        timerStartedAt: null,
        accumulatedTime: 110, // 100 + 10
      });
    });

    it("should do nothing if task is not found", async () => {
      const taskId = "non-existent";
      mockTaskRepo.findById.mockResolvedValueOnce(null);

      await sut.toggleTimer(taskId);

      expect(mockTaskRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("getTasks", () => {
    it("should call repository findByProjectId with correct projectId", async () => {
      const projectId = "project-1";
      
      await sut.getTasks(projectId);

      expect(mockTaskRepo.findByProjectId).toHaveBeenCalledWith(projectId);
    });
  });
});

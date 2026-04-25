import { describe, it, expect, vi } from "vitest";
import { ProjectUseCases } from "./project-use-cases";
import { ProjectRepository } from "@/src/domain/project/ProjectRepository";

describe("ProjectUseCases", () => {
  const mockProjectRepo: ProjectRepository = {
    create: vi.fn(),
    findByFolderId: vi.fn(),
    findById: vi.fn(),
  };

  const sut = new ProjectUseCases(mockProjectRepo);

  describe("createProject", () => {
    it("should call repository create with correct data", async () => {
      const data = {
        userId: "user-1",
        folderId: "folder-1",
        name: "Project 1",
        hourlyRate: 50,
        fixedPrice: null,
      };
      
      await sut.createProject(data.userId, data.folderId, data.name, data.hourlyRate, data.fixedPrice);

      expect(mockProjectRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe("getProjects", () => {
    it("should call repository findByFolderId with correct folderId", async () => {
      const folderId = "folder-1";
      
      await sut.getProjects(folderId);

      expect(mockProjectRepo.findByFolderId).toHaveBeenCalledWith(folderId);
    });
  });

  describe("getProject", () => {
    it("should call repository findById with correct projectId", async () => {
      const projectId = "project-1";
      
      await sut.getProject(projectId);

      expect(mockProjectRepo.findById).toHaveBeenCalledWith(projectId);
    });
  });
});

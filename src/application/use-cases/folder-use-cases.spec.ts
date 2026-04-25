import { describe, it, expect, vi } from "vitest";
import { FolderUseCases } from "./folder-use-cases";
import { FolderRepository } from "@/src/domain/folder/FolderRepository";

describe("FolderUseCases", () => {
  const mockFolderRepo: FolderRepository = {
    create: vi.fn(),
    findByUserId: vi.fn(),
  };

  const sut = new FolderUseCases(mockFolderRepo);

  describe("createFolder", () => {
    it("should call repository create with correct data", async () => {
      const userId = "user-1";
      const name = "My Folder";
      
      await sut.createFolder(userId, name);

      expect(mockFolderRepo.create).toHaveBeenCalledWith({ userId, name });
    });
  });

  describe("getFolders", () => {
    it("should call repository findByUserId with correct userId", async () => {
      const userId = "user-1";
      
      await sut.getFolders(userId);

      expect(mockFolderRepo.findByUserId).toHaveBeenCalledWith(userId);
    });
  });
});

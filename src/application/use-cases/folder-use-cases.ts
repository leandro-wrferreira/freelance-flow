import { FolderRepository } from "@/src/domain/folder/FolderRepository";

export class FolderUseCases {
  constructor(private folderRepo: FolderRepository) {}

  async createFolder(userId: string, name: string) {
    return this.folderRepo.create({ userId, name });
  }

  async getFolders(userId: string) {
    return this.folderRepo.findByUserId(userId);
  }
}

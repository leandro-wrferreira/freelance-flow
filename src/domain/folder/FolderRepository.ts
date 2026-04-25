import { Folder } from "./Folder";

export interface FolderRepository {
  create(data: Omit<Folder, "id" | "createdAt">): Promise<Folder>;
  findByUserId(userId: string): Promise<Folder[]>;
}

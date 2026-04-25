export interface Project {
  id: string;
  name: string;
  folderId: string;
  userId: string;
  hourlyRate: number | null;
  fixedPrice: number | null;
  createdAt: Date;
}

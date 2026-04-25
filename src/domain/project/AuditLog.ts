export interface AuditLog {
  id: string;
  projectId: string;
  action: string;
  details: string;
  createdAt: Date;
}

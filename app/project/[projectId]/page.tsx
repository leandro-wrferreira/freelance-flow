import { getProject, getTasks } from "@/app/actions";
import { getSession } from "@/src/infrastructure/auth/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, DollarSign } from "lucide-react";
import { TaskBoard } from "@/src/components/organisms/TaskBoard";
import { Badge } from "@/src/components/atoms/badge";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/");

  const { projectId } = await params;
  const project = await getProject(projectId);
  
  if (!project || project.userId !== session.user.id) {
    redirect("/");
  }

  const tasks = await getTasks(projectId);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-2 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
            <Link href="/" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold hover:text-primary flex items-center gap-1 transition-colors">
            <ChevronLeft className="size-3" /> Workspace
            </Link>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{project.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          {project.hourlyRate !== null && (
            <Badge variant="secondary" className="flex items-center gap-2 h-9 px-4 rounded-xl border-border bg-card/50 text-foreground font-medium">
              <Clock className="size-3.5 text-primary" /> R$ {project.hourlyRate}/h
            </Badge>
          )}
          {project.fixedPrice !== null && (
            <Badge variant="secondary" className="flex items-center gap-2 h-9 px-4 rounded-xl border-border bg-card/50 text-foreground font-medium">
              <DollarSign className="size-3.5 text-primary" /> R$ {project.fixedPrice} Fixo
            </Badge>
          )}
        </div>
      </div>

      <TaskBoard initialTasks={tasks} projectId={projectId} />
    </div>
  );
}

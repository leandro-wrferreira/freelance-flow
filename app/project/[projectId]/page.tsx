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
      <TaskBoard 
        initialTasks={tasks} 
        projectId={projectId} 
        projectName={project.name}
        hourlyRate={project.hourlyRate}
      />

    </div>
  );
}

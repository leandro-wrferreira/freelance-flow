import { getProject, getTasks } from "@/app/actions";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, DollarSign } from "lucide-react";
import { TaskBoard } from "@/src/components/organisms/TaskBoard";
import { Badge } from "@/src/components/atoms/badge";

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  
  if (!project) {
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

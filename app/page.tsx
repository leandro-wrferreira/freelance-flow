import { getSession } from "@/src/infrastructure/auth/auth-server";
import { getFolders, getProjects, createFolder, createProject } from "@/app/actions";
import { LogIn, Folder as FolderIcon, Plus, Briefcase, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { FolderList } from "@/src/components/organisms/FolderList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/atoms/card";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Card className="max-w-md w-full rounded-3xl bg-card/50 border-border backdrop-blur-sm shadow-xl">
          <CardHeader className="flex flex-col items-center gap-4 pb-2">
            <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Briefcase className="size-7" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Freelance Flow</CardTitle>
              <CardDescription className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                Gerencie seus projetos freelance, rastreie seu tempo de atividades e monetize seu trabalho.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground bg-muted/50 border border-border rounded-2xl p-6 text-left flex items-start gap-3">
              <div className="size-2 bg-primary rounded-full mt-1.5 shrink-0 animate-pulse" />
              <p>Necessário realizar login pelo cabeçalho superior para continuar e acessar seu workspace.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const folders = await getFolders(session.user.id);
  // Pre-fetch all projects for the folders to minimize waterfall
  const foldersWithProjects = await Promise.all(
    folders.map(async (folder) => ({
      ...folder,
      projects: await getProjects(folder.id),
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="px-2">
        <h1 className="text-2xl font-bold text-white">Workspace</h1>
      </div>

      <FolderList initialFolders={foldersWithProjects} userId={session.user.id} />
    </div>
  );
}

import { getFolders, getProjects } from "@/app/actions";
import { FolderList } from "@/src/components/organisms/FolderList";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const userId = "default-user";
  const folders = await getFolders(userId);
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

      <FolderList initialFolders={foldersWithProjects} userId={userId} />
    </div>
  );
}

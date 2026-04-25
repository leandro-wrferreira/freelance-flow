import { TopNav } from "@/src/components/organisms/TopNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <TopNav />
      <main className="flex-1 w-full flex flex-col gap-6">
        {children}
      </main>
    </div>
  );
}

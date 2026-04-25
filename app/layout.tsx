import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { MainLayout } from "@/src/components/templates/MainLayout";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freelance Flow',
  description: 'Manage freelance projects and track time',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={cn("dark", geist.variable)}>
      <body className={cn(inter.className, "bg-background text-foreground min-h-screen flex flex-col p-4 sm:p-6 gap-6 antialiased")} suppressHydrationWarning>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}

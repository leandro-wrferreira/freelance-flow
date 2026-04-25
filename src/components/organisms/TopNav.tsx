"use client";

import { useSession, signIn, signOut } from "@/src/infrastructure/auth/auth-client";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/atoms/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/atoms/avatar";

export function TopNav() {
  const { data: session, isPending } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <nav className="flex items-center justify-between bg-card/50 border border-border rounded-2xl px-6 py-3 w-full max-w-7xl mx-auto z-10 hidden sm:flex h-[74px]" />;

  return (
    <nav className="flex items-center justify-between bg-card/50 border border-border rounded-2xl px-6 py-3 w-full max-w-7xl mx-auto z-10 hidden sm:flex backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground shadow-sm">F</div>
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
          Freelance Flow <span className="text-muted-foreground font-normal">/ Workspace</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : session ? (
          <div className="flex items-center gap-4 border-l border-border pl-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {session.user.name}
              </span>
              <Avatar className="size-8 border border-border">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="bg-muted text-[10px]">{session.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="gap-2 h-9 rounded-xl"
            >
              <LogOut data-icon="inline-start" />
              Sair
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => signIn.social({ provider: "google" })}
            className="gap-2 rounded-xl h-10 px-6"
          >
            <LogIn data-icon="inline-start" />
            Entrar com Google
          </Button>
        )}
      </div>
    </nav>
  );
}

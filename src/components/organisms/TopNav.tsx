"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/src/components/atoms/avatar";

export function TopNav() {
  return (
    <nav className="flex items-center justify-between bg-card/50 border border-border rounded-2xl px-6 py-3 w-full max-w-7xl mx-auto z-10 hidden sm:flex backdrop-blur-sm h-[74px]">
      <div className="flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground shadow-sm">F</div>
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
          Freelance Flow <span className="text-muted-foreground font-normal">/ Workspace</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 border-l border-border pl-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            Default User
          </span>
          <Avatar className="size-8 border border-border">
            <AvatarFallback className="bg-muted text-[10px]">DU</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}

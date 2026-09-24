"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, LayoutTemplate, Bot, Rocket, Plus, Search } from "lucide-react";
import { openPalette } from "@/components/shell/command-palette";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/deployments", label: "Deploys", icon: Rocket },
];

export function MobileTopBar({ name }: { name: string }) {
  return (
    <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur md:hidden">
      <Link href="/home" className="flex items-center gap-2">
        <LogoMark className="h-6 w-6" />
        <span className="text-[13px] font-semibold">{name === "Guest" ? "Demo workspace" : `${name.split(" ")[0]}'s workspace`}</span>
      </Link>
      <div className="flex items-center gap-1.5"><button onClick={openPalette} aria-label="Search" className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-text-2"><Search className="h-4 w-4" /></button><Link href="/home" aria-label="New project" className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink"><Plus className="h-4 w-4" /></Link></div>
    </div>
  );
}

export function MobileTabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-elev/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          const I = it.icon;
          return (
            <Link key={it.href} href={it.href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10.5px]", active ? "text-accent" : "text-text-3")}>
              <I className="h-[18px] w-[18px]" />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

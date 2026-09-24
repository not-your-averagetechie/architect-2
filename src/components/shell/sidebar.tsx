"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, LayoutTemplate, Bot, Rocket, Settings, ChevronsUpDown, Plus, LogOut, BookOpen } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Kbd } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions";
import type { Viewer } from "@/lib/session";

const nav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/agents", label: "Agent library", icon: Bot },
  { href: "/deployments", label: "Deployments", icon: Rocket },
];

export function Sidebar({ viewer }: { viewer: Viewer }) {
  const path = usePathname();
  const initials = viewer.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-elev md:flex">
      <div className="p-3">
        <button className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-surface-2">
          <LogoMark className="h-7 w-7" />
          <span className="flex-1 text-left">
            <span className="block text-[13px] font-semibold leading-tight">{viewer.name === "Guest" ? "Demo workspace" : `${viewer.name.split(" ")[0]}'s workspace`}</span>
            <span className="block text-[11px] text-text-3">Pro · 3 members</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-text-3" />
        </button>
      </div>

      <div className="px-3">
        <Link href="/home" className="focus-ring flex h-9 items-center justify-between rounded-lg border border-line bg-surface px-3 text-[13px] text-text-2 hover:border-line-strong hover:text-text">
          <span className="inline-flex items-center gap-2"><Plus className="h-3.5 w-3.5" /> New project</span>
          <Kbd>N</Kbd>
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {nav.map((n) => {
          const active = path === n.href || (n.href !== "/home" && path.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={cn("focus-ring flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors", active ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface hover:text-text")}>
              <n.icon className={cn("h-4 w-4", active ? "text-accent" : "text-text-3")} /> {n.label}
            </Link>
          );
        })}
        <div className="px-2.5 pb-2 pt-6 text-[11px] font-medium uppercase tracking-wider text-text-3">Recent</div>
        {["Lead Scout", "Support Copilot", "Market Pulse"].map((p, i) => (
          <Link key={p} href={`/p/${p.toLowerCase().replace(/ /g, "-")}`} className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-text-2 hover:bg-surface hover:text-text">
            <span className="h-2 w-2 rounded-sm" style={{ background: `hsl(${[78, 200, 280][i]} 80% 60%)` }} /> {p}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 p-3">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="flex items-center justify-between text-[12px]"><span className="text-text-2">Build credits</span><span className="font-mono text-text">6,240 / 10k</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full w-[62%] rounded-full bg-accent" /></div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/settings" className="flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-2">
            {viewer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewer.image} alt="" className="h-7 w-7 rounded-full" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[11px] font-medium">{initials}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px]">{viewer.name}</span>
              <span className="block text-[11px] capitalize text-text-3">{viewer.provider === "demo" ? "Demo session" : `via ${viewer.provider}`}</span>
            </span>
          </Link>
          <Link href="/settings" className="rounded-lg p-2 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Settings"><Settings className="h-4 w-4" /></Link>
          <form action={logout}><button className="rounded-lg p-2 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></form>
        </div>
        <a href="https://docs.architect.new" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 text-[11px] text-text-3 hover:text-text-2"><BookOpen className="h-3 w-3" /> Docs & changelog</a>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Clock, FolderKanban, GitBranch, LayoutTemplate, Plus, Search, Sparkles } from "lucide-react";
import { projects } from "@/lib/data";
import { Badge } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader, Empty } from "./page-header";

const FILTERS = [["all", "All"], ["live", "Live"], ["building", "Building"], ["draft", "Drafts"]] as const;

export function ProjectsView() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const list = useMemo(() => projects.filter((p) => (f === "all" || p.status === f) && (p.name + p.description).toLowerCase().includes(q.toLowerCase())), [q, f]);
  return (
    <div>
      <PageHeader title="Projects" sub={`${projects.length} projects in this workspace`}>
        <Link href="/home" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-ink hover:brightness-110"><Plus className="h-4 w-4" /> New project</Link>
      </PageHeader>
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-8">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-line bg-elev px-3 sm:max-w-sm">
          <Search className="h-3.5 w-3.5 text-text-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-3" />
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setF(k)} className={cn("h-8 shrink-0 rounded-lg px-3 text-[13px]", f === k ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")}>
              {l} <span className="ml-1 text-text-3">{k === "all" ? projects.length : projects.filter((p) => p.status === k).length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-10 sm:px-8">
        {list.length === 0 ? (
          <Empty icon={<FolderKanban className="h-5 w-5" />} title="No projects match" body="Try a different search, or start something new from a prompt." action={<button onClick={() => { setQ(""); setF("all"); }} className="h-8 rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2">Clear filters</button>} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/p/${p.id}`} className="group flex h-full flex-col rounded-2xl border border-line bg-elev p-4 transition-colors hover:border-line-strong">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-bg" style={{ background: `hsl(${p.hue} 85% 65%)` }}>{p.name[0]}</span>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-3"><Clock className="h-3 w-3" /> {p.updated} · {p.agents} agents</div>
                      </div>
                    </div>
                    {p.status === "live" && <Badge tone="ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Live</Badge>}
                    {p.status === "building" && <Badge tone="accent"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Building</Badge>}
                    {p.status === "draft" && <Badge>Draft</Badge>}
                  </div>
                  <p className="mt-3 line-clamp-2 flex-1 text-[13px] leading-relaxed text-text-2">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11.5px] text-text-3">
                    <span className="inline-flex items-center gap-1.5">
                      {p.origin === "github" ? <><GitBranch className="h-3 w-3" /> <span className="font-mono">{p.repo}</span></> : p.origin === "template" ? <><LayoutTemplate className="h-3 w-3" /> From template</> : <><Sparkles className="h-3 w-3" /> From prompt</>}
                    </span>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">Open →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
            <Link href="/home" className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-[13px] text-text-3 transition-colors hover:border-accent/40 hover:text-text">
              <Plus className="h-5 w-5" /> New project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

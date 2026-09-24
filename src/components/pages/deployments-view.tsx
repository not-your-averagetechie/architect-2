"use client";

import Link from "next/link";
import { useState } from "react";
import { GitBranch, GitCommit } from "lucide-react";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";

const MSGS = ["Add follow-up queue filters", "Scorer: confidence threshold", "Mask phone numbers in logs", "Weekly report layout", "New onboarding copy", "Retry Zendesk on 429"];
const rows = projects.flatMap((p, pi) => [0, 1, 2].map((k) => ({
  id: `${p.id}-${k}`, project: p, env: k === 1 ? "Preview" : "Production", status: pi === 1 && k === 0 ? "building" : pi === 2 && k === 2 ? "failed" : "ready",
  branch: k === 1 ? "feat/" + MSGS[(pi + k) % 6].split(" ")[0].toLowerCase() : "main", commit: (0x1a2b3c + pi * 7919 + k * 104729).toString(16).slice(0, 7),
  msg: MSGS[(pi * 2 + k) % 6], when: ["2m ago", "1h ago", "5h ago", "Yesterday", "2d ago", "4d ago"][(pi + k) % 6], dur: `${40 + ((pi * 7 + k * 5) % 20)}s`,
})));

export function DeploymentsView() {
  const [env, setEnv] = useState<"All" | "Production" | "Preview">("All");
  const list = rows.filter((r) => env === "All" || r.env === env);
  return (
    <div>
      <PageHeader title="Deployments" sub="Every deploy across the workspace. Open one to roll back." />
      <div className="flex gap-1 px-4 py-4 sm:px-8">
        {(["All", "Production", "Preview"] as const).map((e) => <button key={e} onClick={() => setEnv(e)} className={cn("h-8 rounded-lg px-3 text-[13px]", env === e ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")}>{e}</button>)}
      </div>
      <div className="px-4 pb-10 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-line">
          {list.map((d) => (
            <Link key={d.id} href={`/p/${d.project.id}/deploy`} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-white/[0.02]">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", d.status === "ready" ? "bg-ok" : d.status === "failed" ? "bg-danger" : "animate-pulse bg-accent")} />
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold text-bg" style={{ background: `hsl(${d.project.hue} 85% 65%)` }}>{d.project.name[0]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13px]"><span className="truncate font-medium">{d.msg}</span>{d.status === "failed" && <span className="rounded-md bg-danger/15 px-1.5 py-0.5 text-[10.5px] text-danger">Failed</span>}{d.status === "building" && <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10.5px] text-accent">Building</span>}</div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11.5px] text-text-3">
                  <span>{d.project.name}</span><span>{d.env}</span>
                  <span className="hidden items-center gap-1 font-mono sm:inline-flex"><GitBranch className="h-3 w-3" />{d.branch}</span>
                  <span className="hidden items-center gap-1 font-mono sm:inline-flex"><GitCommit className="h-3 w-3" />{d.commit}</span>
                </div>
              </div>
              <div className="shrink-0 text-right text-[11.5px] text-text-3"><div>{d.when}</div><div className="font-mono">{d.dur}</div></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

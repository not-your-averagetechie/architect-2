"use client";

import Link from "next/link";
import { useState } from "react";
import { Bot, Search, Shield, UserCheck } from "lucide-react";
import { projects } from "@/lib/data";
import { makePlan } from "@/lib/plan";
import { PageHeader, Empty } from "./page-header";

const rows = projects.flatMap((p, pi) => makePlan(p.description).agents.map((a, ai) => ({ ...a, project: p, runs: [1284, 412, 96, 2210][(pi + ai) % 4] - ai * 37, success: [99.2, 97.8, 98.6, 95.4][(pi + ai) % 4], cost: [0.012, 0.004, 0.021, 0.008][(pi + ai) % 4], approval: ai === 2, fw: ["Lyzr ADK", "LangGraph", "Lyzr ADK", "OpenAI Agents SDK"][pi % 4] })));

export function AgentsView() {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => (r.name + r.role + r.project.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Agent library" sub={`${rows.length} agents across ${projects.length} projects. Reuse any of them in a new project.`} />
      <div className="px-4 py-4 sm:px-8">
        <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-elev px-3 sm:max-w-sm">
          <Search className="h-3.5 w-3.5 text-text-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, roles, projects" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-text-3" />
        </div>
      </div>
      <div className="px-4 pb-10 sm:px-8">
        {list.length === 0 ? <Empty icon={<Bot className="h-5 w-5" />} title="No agents match" body="Try another word, like a tool name or a project." /> : (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="hidden grid-cols-[1.6fr_1fr_90px_90px_80px] gap-4 border-b border-line bg-elev px-4 py-2.5 text-[11.5px] text-text-3 md:grid">
              <span>Agent</span><span>Project</span><span className="text-right">Runs (7d)</span><span className="text-right">Success</span><span className="text-right">Cost/run</span>
            </div>
            {list.map((r, i) => (
              <Link key={r.project.id + r.id + i} href={`/p/${r.project.id}/agents?agent=${r.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-0 hover:bg-white/[0.02] md:grid-cols-[1.6fr_1fr_90px_90px_80px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2"><Bot className="h-4 w-4 text-text-2" /></span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[13.5px] font-medium">{r.name}{r.approval && <UserCheck className="h-3 w-3 text-text-3" />}<Shield className="h-3 w-3 text-text-3" /></div>
                    <div className="truncate text-[12px] text-text-3">{r.role}</div>
                  </div>
                </div>
                <div className="hidden min-w-0 md:block"><div className="truncate text-[13px] text-text-2">{r.project.name}</div><div className="font-mono text-[11px] text-text-3">{r.fw} · {r.model}</div></div>
                <span className="hidden text-right font-mono text-[12.5px] text-text-2 md:block">{r.runs.toLocaleString()}</span>
                <span className={`text-right font-mono text-[12.5px] ${r.success > 97 ? "text-ok" : "text-warn"}`}>{r.success}%</span>
                <span className="hidden text-right font-mono text-[12.5px] text-text-3 md:block">${r.cost.toFixed(3)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

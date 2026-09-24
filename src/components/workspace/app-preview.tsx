"use client";

import { motion } from "motion/react";
import { Bot, Search, Bell, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";

const NAMES = ["Priya Nair", "Marco Ruiz", "Aiko Tan", "Dev Shah", "Lena Park", "Omar Haddad", "Sara Kim"];
const STATUS = ["Ready", "In review", "Blocked", "Done", "Ready", "In review", "Done"];

function Skel({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-black/[0.06] shimmer", className)} />;
}

/** stage: 0 nothing, 1 layout, 2 content, 3 agents live */
export function AppPreview({ plan, stage, page, onPage, selectMode, onSelect, device }: {
  plan: Plan; stage: number; page: number; onPage: (i: number) => void;
  selectMode: boolean; onSelect: (label: string) => void; device: "desktop" | "tablet" | "mobile";
}) {
  const table = plan.data[0];
  const cols = (table?.fields ?? ["name", "status"]).slice(0, device === "mobile" ? 2 : 4);
  const sel = (label: string) => (selectMode ? { "data-edit": label, onClick: (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onSelect(label); } } : {});
  const selCls = selectMode ? "cursor-crosshair hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-[#7c5cff]" : "";
  const narrow = device === "mobile";

  return (
    <div className="flex h-full min-h-[560px] bg-[#fafaf9] text-[#18181b]" style={{ fontFamily: "var(--font-geist-sans)" }}>
      {!narrow && (
        <aside className="w-48 shrink-0 border-r border-black/[0.06] bg-white p-3">
          {stage < 1 ? <div className="space-y-2"><Skel className="h-6 w-28" /><Skel className="mt-6 h-4 w-32" /><Skel className="h-4 w-24" /><Skel className="h-4 w-28" /></div> : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div {...sel("App logo and name")} className={cn("flex items-center gap-2 px-2 py-1.5 text-[13px] font-semibold", selCls)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#18181b] text-[11px] text-white">{plan.name[0]}</span>{plan.name}
              </div>
              <nav className="mt-5 space-y-0.5">
                {plan.pages.map((p, i) => (
                  <button key={p + i} onClick={() => onPage(i)} {...sel(`Sidebar item "${p}"`)} className={cn("block w-full rounded-md px-2 py-1.5 text-left text-[12.5px]", i === page ? "bg-black/[0.05] font-medium" : "text-black/55 hover:bg-black/[0.03]", selCls)}>{p}</button>
                ))}
              </nav>
            </motion.div>
          )}
        </aside>
      )}
      <main className="min-w-0 flex-1 p-5">
        {stage < 1 ? (
          <div className="space-y-4"><Skel className="h-7 w-48" /><div className="grid grid-cols-3 gap-3"><Skel className="h-20" /><Skel className="h-20" /><Skel className="h-20" /></div><Skel className="h-56" /></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between gap-3">
              <h1 {...sel("Page title")} className={cn("text-lg font-semibold tracking-tight", selCls)}>{plan.pages[page] ?? plan.name}</h1>
              <div className="flex items-center gap-2">
                {!narrow && <div className="flex h-8 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-2.5 text-[12px] text-black/40"><Search className="h-3.5 w-3.5" /> Search</div>}
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white"><Bell className="h-3.5 w-3.5 text-black/50" /></span>
              </div>
            </div>
            <div className={cn("mt-4 grid gap-3", narrow ? "grid-cols-1" : "grid-cols-3")}>
              {stage < 2 ? [0, 1, 2].map((i) => <Skel key={i} className="h-[76px]" />) : [
                { k: `Total ${table?.name ?? "items"}`, v: "1,284", t: "+8.2%", icon: TrendingUp, c: "text-emerald-600" },
                { k: "Handled by agents", v: "72%", t: "+14 pts", icon: Bot, c: "text-violet-600" },
                { k: "Needs review", v: "18", t: "3 urgent", icon: AlertCircle, c: "text-amber-600" },
              ].map((m) => (
                <motion.div key={m.k} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} {...sel(`Metric card "${m.k}"`)} className={cn("rounded-xl border border-black/[0.06] bg-white p-3.5", selCls)}>
                  <div className="flex items-center justify-between text-[11.5px] text-black/50">{m.k}<m.icon className={cn("h-3.5 w-3.5", m.c)} /></div>
                  <div className="mt-1.5 text-xl font-semibold tracking-tight">{m.v}</div>
                  <div className={cn("text-[11px]", m.c)}>{m.t}</div>
                </motion.div>
              ))}
            </div>
            <div className={cn("mt-4 grid gap-3", narrow ? "grid-cols-1" : "grid-cols-[1fr_220px]")}>
              <div {...sel(`${table?.name ?? "Data"} table`)} className={cn("overflow-hidden rounded-xl border border-black/[0.06] bg-white", selCls)}>
                {stage < 2 ? <div className="space-y-2 p-3">{[0, 1, 2, 3, 4].map((i) => <Skel key={i} className="h-7" />)}</div> : (
                  <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-[12px]">
                    <thead className="border-b border-black/[0.06] bg-black/[0.015] text-black/45">
                      <tr>{cols.map((c) => <th key={c} className="px-3 py-2 font-medium capitalize">{c.replace(/_/g, " ")}</th>)}</tr>
                    </thead>
                    <tbody>
                      {NAMES.slice(0, 6).map((n, r) => (
                        <tr key={n} className="border-b border-black/[0.04] last:border-0">
                          {cols.map((c, ci) => (
                            <td key={c} className="px-3 py-2">
                              {ci === 0 ? <span className="font-medium">{n}</span> : c.match(/status|stage|tags|sentiment/) ? (
                                <span className={cn("rounded-full px-2 py-0.5 text-[10.5px]", STATUS[r] === "Blocked" ? "bg-red-50 text-red-600" : STATUS[r] === "Done" ? "bg-emerald-50 text-emerald-700" : "bg-black/[0.05] text-black/60")}>{STATUS[r]}</span>
                              ) : <span className="text-black/55">{fakeCell(c, n, r)}</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
              <div {...sel("Agent activity panel")} className={cn("rounded-xl border border-black/[0.06] bg-white p-3", selCls)}>
                <div className="text-[11.5px] font-medium text-black/50">Agent activity</div>
                <div className="mt-2.5 space-y-2.5">
                  {stage < 3 ? [0, 1, 2].map((i) => <Skel key={i} className="h-9" />) : plan.agents.map((a, i) => (
                    <motion.div key={a.id + i} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-50"><Bot className="h-3 w-3 text-violet-600" /></span>
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium">{a.name}</div>
                        <div className="flex items-center gap-1 text-[10.5px] text-black/45"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> {["ran 2m ago", "ran 6m ago", "idle", "ran 1h ago"][i % 4]}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

const FAKE: Record<string, string[]> = {
  company: ["Northwind", "Halo Labs", "Brightline", "Kestrel Co", "Parallel", "Oakridge"],
  summary: ["Wants a pilot in Q4", "Pricing concerns", "Asked for a demo", "Ready to sign", "Needs legal review", "Follow up Friday"],
  next_steps: ["Send proposal", "Book demo", "Share case study", "Loop in CFO", "Send contract", "Check in"],
  subject: ["Great chatting today", "Your pilot plan", "Next steps", "Quick recap", "Proposal attached", "Checking in"],
  body: ["Thanks for the time...", "As promised, here...", "Following up on...", "Here's a recap...", "Attached is...", "Wanted to check..."],
  title: ["Refund request", "Login issue", "Billing question", "Feature request", "Bug report", "Account access"],
  topic: ["Leave policy", "Benefits", "Payroll", "Remote work", "Travel", "Onboarding"],
  owner: ["Priya", "Marco", "Aiko", "Dev", "Lena", "Omar"],
  priority: ["High", "Medium", "Low", "High", "Low", "Medium"],
  channel: ["Email", "Chat", "Phone", "Email", "Chat", "Web"],
  market: ["Fed cut in Dec", "BTC > 100k", "Election turnout", "Rain in SF", "GPT-6 by June", "Oil > $90"],
  odds: ["62%", "48%", "71%", "33%", "55%", "19%"],
  score: ["92", "78", "64", "88", "41", "73"],
  amount: ["$12,400", "$8,900", "$24,000", "$3,200", "$15,750", "$6,100"],
};
function fakeCell(col: string, name: string, r: number): string {
  const c = col.toLowerCase();
  if (FAKE[c]) return FAKE[c][r % 6];
  if (c.includes("email")) return `${name.split(" ")[0].toLowerCase()}@acme.co`;
  if (c === "at" || c.endsWith("_at") || c.includes("date") || c.includes("time")) return `${r + 1}h ago`;
  if (c.endsWith("_id") || c === "id") return `#${1040 + r * 7}`;
  if (c.includes("name")) return name;
  const k = Object.keys(FAKE).find((f) => c.includes(f));
  if (k) return FAKE[k][r % 6];
  return `${c.replace(/_/g, " ")} ${r + 1}`;
}

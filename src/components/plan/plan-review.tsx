"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Bot, Check, Database, FileText, GripVertical, LayoutPanelLeft, Loader2, Plug, Plus, RefreshCw, Sparkles, X, HelpCircle, Wand2, Clock, Coins } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Badge } from "@/components/ui/button";
import { makePlan, integrationCatalog, PLAN_KEY, slugify, type Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";

const thinking = ["Reading your request", "Choosing pages and flows", "Designing the agent team", "Modelling your data", "Picking integrations"];

export function PlanReview({ prompt, lens }: { prompt: string; lens: "describe" | "code" }) {
  const router = useRouter();
  const initial = useMemo(() => makePlan(prompt), [prompt]);
  const [plan, setPlan] = useState<Plan>(initial);
  const [step, setStep] = useState(0);
  const [refine, setRefine] = useState("");
  const [refining, setRefining] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const ready = step >= thinking.length;

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setStep((s) => s + 1), 420);
    return () => clearTimeout(t);
  }, [step, ready]);

  const update = (fn: (p: Plan) => Plan) => setPlan((p) => fn(structuredClone(p)));
  const answered = plan.questions.filter((q) => q.answer).length;
  const minutes = 2 + plan.pages.length * 0.4 + plan.agents.length * 0.5;
  const credits = Math.round(120 + plan.pages.length * 45 + plan.agents.length * 60 + plan.integrations.length * 20);

  const applyRefine = () => {
    const text = refine.trim();
    if (!text) return;
    setRefining(true);
    setTimeout(() => {
      update((p) => {
        const m = text.match(/(?:add|also)\s+(?:a|an)?\s*([\w\s-]{3,30}?)\s+(page|screen)/i);
        const ag = text.match(/(?:add|also)\s+(?:a|an)?\s*([\w\s-]{3,30}?)\s+agent/i);
        const integ = integrationCatalog.find((i) => text.toLowerCase().includes(i.toLowerCase()));
        if (m) p.pages.push(m[1].replace(/\b\w/g, (c) => c.toUpperCase()).trim());
        if (ag) p.agents.push({ id: slugify(ag[1]), name: ag[1].replace(/\b\w/g, (c) => c.toUpperCase()).trim(), role: text, tools: [], model: "gpt-4.1" });
        if (integ && !p.integrations.includes(integ)) p.integrations.push(integ);
        if (!m && !ag && !integ) p.summary = `${p.summary} ${text}`.trim();
        return p;
      });
      setFlash(text);
      setRefine("");
      setRefining(false);
      setTimeout(() => setFlash(null), 2400);
    }, 700);
  };

  const approve = () => {
    const slug = slugify(plan.name);
    const final = { ...plan, slug };
    sessionStorage.setItem(PLAN_KEY(slug), JSON.stringify(final));
    router.push(`/p/${slug}?build=1&lens=${lens}`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/85 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/home" className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
          <LogoMark className="h-6 w-6" />
          <span className="text-[13px] text-text-3">New project</span>
          <span className="text-text-3">/</span>
          <span className="text-[13px]">{ready ? plan.name : "Planning…"}</span>
        </div>
        <ol className="hidden items-center gap-2 text-xs md:flex">
          {["Plan", "Build", "Ship"].map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[10px]", i === 0 ? "border-accent bg-accent text-accent-ink" : "border-line-strong text-text-3")}>{i + 1}</span>
              <span className={i === 0 ? "text-text" : "text-text-3"}>{s}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-line-strong" />}
            </li>
          ))}
        </ol>
        <div className="w-24" />
      </header>

      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div key="thinking" exit={{ opacity: 0, y: -8 }} className="mx-auto max-w-xl px-6 pt-24">
            <div className="rounded-2xl border border-line bg-elev p-5">
              <div className="text-[11px] uppercase tracking-wider text-text-3">Your request</div>
              <p className="mt-2 text-[15px] leading-relaxed">&ldquo;{prompt || "An agentic app"}&rdquo;</p>
            </div>
            <div className="mt-6 space-y-2.5">
              {thinking.map((t, i) => (
                <motion.div key={t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 text-sm">
                  {i < step ? <Check className="h-4 w-4 text-ok" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="h-4 w-4 rounded-full border border-line-strong" />}
                  <span className={i < step ? "text-text-2" : ""}>{t}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
            <main className="min-w-0 space-y-10">
              <section>
                <div className="flex items-center gap-2 text-xs text-accent"><Sparkles className="h-3.5 w-3.5" /> Draft plan · edit anything before we build</div>
                <input value={plan.name} onChange={(e) => update((p) => ({ ...p, name: e.target.value }))} className="focus-ring mt-3 w-full rounded-lg bg-transparent text-4xl font-semibold tracking-[-0.03em] outline-none" aria-label="App name" />
                <textarea value={plan.summary} onChange={(e) => update((p) => ({ ...p, summary: e.target.value }))} rows={2} className="focus-ring mt-2 w-full resize-none rounded-lg bg-transparent text-[15px] leading-relaxed text-text-2 outline-none" aria-label="Summary" />
                <div className="mt-2 flex items-center gap-2 text-xs text-text-3">For <Badge>{plan.audience}</Badge></div>
                <AnimatePresence>{flash && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs text-accent"><Check className="h-3.5 w-3.5" /> Plan updated: &ldquo;{flash}&rdquo;</motion.div>}</AnimatePresence>
              </section>

              {plan.questions.length > 0 && (
                <section className="rounded-2xl border border-accent/20 bg-accent-soft/40 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><HelpCircle className="h-4 w-4 text-accent" /> {plan.questions.length} quick questions so I build the right thing</div>
                    <span className="text-xs text-text-3">{answered}/{plan.questions.length} answered · optional</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {plan.questions.map((q, qi) => (
                      <div key={q.id}>
                        <div className="text-[13px] text-text-2">{q.q}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {q.options.map((o) => (
                            <button key={o} onClick={() => update((p) => { p.questions[qi].answer = p.questions[qi].answer === o ? undefined : o; return p; })}
                              className={cn("focus-ring rounded-full border px-3 py-1 text-[13px] transition-colors", q.answer === o ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-bg/60 text-text-2 hover:text-text")}>
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <Section icon={LayoutPanelLeft} title="Pages" count={plan.pages.length} onAdd={() => update((p) => { p.pages.push("New page"); return p; })} addLabel="Add page">
                <div className="overflow-hidden rounded-2xl border border-line">
                  {plan.pages.map((pg, i) => (
                    <div key={i} className="group flex items-center gap-3 border-b border-line bg-elev px-3 py-2.5 last:border-b-0">
                      <GripVertical className="h-4 w-4 cursor-grab text-text-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      <span className="w-5 font-mono text-xs text-text-3">{String(i + 1).padStart(2, "0")}</span>
                      <input value={pg} onChange={(e) => update((p) => { p.pages[i] = e.target.value; return p; })} className="focus-ring flex-1 rounded bg-transparent text-sm outline-none" aria-label={`Page ${i + 1}`} />
                      <span className="hidden font-mono text-[11px] text-text-3 sm:block">/{slugify(pg)}</span>
                      <button onClick={() => update((p) => { p.pages.splice(i, 1); return p; })} className="rounded p-1 text-text-3 opacity-0 hover:bg-surface-2 hover:text-text group-hover:opacity-100" aria-label="Remove page"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={Bot} title="Agent team" count={plan.agents.length} onAdd={() => update((p) => { p.agents.push({ id: `agent-${p.agents.length}`, name: "New agent", role: "Describe what this agent does", tools: [], model: "gpt-4.1" }); return p; })} addLabel="Add agent">
                <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
                  {plan.agents.map((a, i) => (
                    <div key={a.id + i} className="flex flex-1 items-center gap-2 md:flex-col md:items-stretch">
                      <div className="group relative flex-1 rounded-2xl border border-line bg-elev p-4">
                        <button onClick={() => update((p) => { p.agents.splice(i, 1); return p; })} className="absolute right-2 top-2 rounded p-1 text-text-3 opacity-0 hover:bg-surface-2 hover:text-text group-hover:opacity-100" aria-label="Remove agent"><X className="h-3.5 w-3.5" /></button>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2"><Bot className="h-3.5 w-3.5 text-accent" /></span>
                          <input value={a.name} onChange={(e) => update((p) => { p.agents[i].name = e.target.value; return p; })} className="focus-ring min-w-0 flex-1 rounded bg-transparent text-sm font-medium outline-none" aria-label="Agent name" />
                        </div>
                        <textarea value={a.role} onChange={(e) => update((p) => { p.agents[i].role = e.target.value; return p; })} rows={2} className="focus-ring mt-2 w-full resize-none rounded bg-transparent text-[13px] leading-relaxed text-text-2 outline-none" aria-label="Agent role" />
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          <Badge tone="code">{a.model}</Badge>
                          {a.tools.map((t) => <Badge key={t}>{t}</Badge>)}
                        </div>
                      </div>
                      {i < plan.agents.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 rotate-90 self-center text-text-3 md:hidden" />}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-text-3">Agents run left to right and hand off structured output. You can rewire them in the Agents screen.</p>
              </Section>

              <Section icon={Database} title="Data" count={plan.data.length}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {plan.data.map((t) => (
                    <div key={t.name} className="rounded-2xl border border-line bg-elev">
                      <div className="border-b border-line px-4 py-2.5 font-mono text-[13px] text-code">{t.name}</div>
                      <div className="space-y-1 px-4 py-3 font-mono text-xs text-text-2">
                        <div className="text-text-3">id <span className="float-right">uuid</span></div>
                        {t.fields.map((f) => <div key={f}>{f}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={Plug} title="Integrations" count={plan.integrations.length}>
                <div className="flex flex-wrap items-center gap-2">
                  {plan.integrations.map((it) => (
                    <span key={it} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-elev px-2.5 py-1.5 text-[13px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {it}
                      <button onClick={() => update((p) => ({ ...p, integrations: p.integrations.filter((x) => x !== it) }))} className="text-text-3 hover:text-text" aria-label={`Remove ${it}`}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <div className="relative">
                    <button onClick={() => setAddOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 text-[13px] text-text-3 hover:text-text"><Plus className="h-3.5 w-3.5" /> Add</button>
                    {addOpen && (
                      <div className="absolute left-0 top-10 z-20 grid w-72 grid-cols-2 gap-1 rounded-xl border border-line-strong bg-surface p-2 shadow-2xl">
                        {integrationCatalog.filter((i) => !plan.integrations.includes(i)).map((i) => (
                          <button key={i} onClick={() => { update((p) => ({ ...p, integrations: [...p.integrations, i] })); setAddOpen(false); }} className="rounded-lg px-2 py-1.5 text-left text-[13px] text-text-2 hover:bg-surface-2 hover:text-text">{i}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-text-3">You&apos;ll connect accounts after the build. Nothing is accessed until you do.</p>
              </Section>
            </main>

            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-line-strong bg-elev p-5">
                <div className="text-sm font-medium">Ready to build</div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {[["Pages", plan.pages.length], ["Agents", plan.agents.length], ["Tables", plan.data.length], ["Integrations", plan.integrations.length]].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl bg-surface px-3 py-2.5"><dt className="text-text-3">{k}</dt><dd className="mt-0.5 font-mono text-lg text-text">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-4 space-y-2 text-xs text-text-2">
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-text-3" /> Est. build time</span><span className="font-mono">~{Math.round(minutes)} min</span></div>
                  <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-text-3" /> Est. credits</span><span className="font-mono">{credits}</span></div>
                </div>
                <button onClick={approve} disabled={!plan.name.trim() || plan.pages.length === 0} className="focus-ring mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-ink shadow-[0_8px_24px_-8px_rgba(212,255,63,0.5)] hover:brightness-110 disabled:opacity-40">
                  Approve & build <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => { setPlan(makePlan(prompt)); setStep(0); }} className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-[13px] text-text-3 hover:bg-surface-2 hover:text-text"><RefreshCw className="h-3.5 w-3.5" /> Regenerate plan</button>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-[11px] leading-relaxed text-text-3"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Saved as <span className="font-mono text-text-2">plan.md</span> in your repo, so developers can review it in a PR too.</div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-elev p-3">
                <div className="flex items-center gap-2 px-1 text-xs text-text-3"><Wand2 className="h-3.5 w-3.5" /> Refine with a sentence</div>
                <div className="mt-2 flex gap-2">
                  <input value={refine} onChange={(e) => setRefine(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyRefine()} placeholder="Add a billing page, and Stripe" className="focus-ring h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-[13px] placeholder:text-text-3" />
                  <button onClick={applyRefine} disabled={!refine.trim() || refining} className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-2 hover:text-text disabled:opacity-40" aria-label="Apply">{refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}</button>
                </div>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ icon: Icon, title, count, onAdd, addLabel, children }: { icon: typeof Bot; title: string; count: number; onAdd?: () => void; addLabel?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold"><Icon className="h-4 w-4 text-text-3" /> {title} <span className="font-mono text-xs font-normal text-text-3">{count}</span></h2>
        {onAdd && <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-3 hover:bg-surface-2 hover:text-text"><Plus className="h-3.5 w-3.5" /> {addLabel}</button>}
      </div>
      {children}
    </section>
  );
}

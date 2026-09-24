"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, Bot, Check, ChevronDown, Code2, Copy, Loader2, Play, Plus, RotateCcw, Shield, SlidersHorizontal, Sparkles, Square, Wrench, Zap, Brain, UserCheck, CircleDollarSign, X,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { makePlan, PLAN_KEY, integrationCatalog, type Plan } from "@/lib/plan";
import { projects } from "@/lib/data";
import { FRAMEWORKS, MODELS, generateAgentCode, type AgentConfig, type FrameworkId } from "@/lib/frameworks";
import { highlight } from "@/lib/highlight";

type Span = { id: string; agent: number; kind: "agent" | "tool" | "llm"; label: string; ms: number; tokens?: number; status: "running" | "ok"; detail?: string };
type Tab = "configure" | "code" | "test";

function loadPlan(id: string): Plan {
  try { const raw = sessionStorage.getItem(PLAN_KEY(id)); if (raw) return JSON.parse(raw); } catch {}
  const ex = projects.find((p) => p.id === id);
  const p = makePlan(ex?.description ?? id.replace(/-/g, " "));
  return ex ? { ...p, name: ex.name, slug: ex.id, summary: ex.description } : { ...p, slug: id };
}

const toConfig = (p: Plan): AgentConfig[] =>
  p.agents.map((a, i) => ({ ...a, instructions: `${a.role}. Be concise and return structured output the next step can use.`, memory: i === 0, approval: i === p.agents.length - 1, pii: true, maxCost: 0.05, temperature: 0.2 }));

function sampleInput(p: Plan) {
  const s = (p.prompt + " " + p.agents.map((a) => a.name).join(" ")).toLowerCase();
  if (/lead|b2b|prospect/.test(s) && !/call scribe/.test(s)) return "New signup: Marco Ruiz, VP Sales at Loopdesk (120 people, Series B). Came from the pricing page.";
  if (/crm|sales|call|follow/.test(s)) return "Call with Priya Nair (Northwind): wants a pilot in Q4, worried about price vs. HubSpot. Asked for a case study.";
  if (/support|ticket/.test(s)) return "Ticket #4812: \"I was charged twice this month and can't log in to download the invoice.\"";
  if (/hr|policy|handbook/.test(s)) return "How many days of parental leave do I get if I joined 8 months ago?";
  if (/market|odds|predict/.test(s)) return "Fed December rate cut market moved from 48% to 62% in the last 3 hours.";
  return `New request for ${p.name}: summarize what came in today and flag anything urgent.`;
}

export function AgentBuilder({ id, initialAgent }: { id: string; initialAgent?: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [sel, setSel] = useState(0);
  const [fw, setFw] = useState<FrameworkId>("lyzr");
  const [fwOpen, setFwOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("configure");
  const [input, setInput] = useState("");
  const [spans, setSpans] = useState<Span[]>([]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const p = loadPlan(id);
    const cfg = toConfig(p);
    setPlan(p); setAgents(cfg); setInput(sampleInput(p));
    const idx = cfg.findIndex((a) => a.id === initialAgent);
    if (idx >= 0) setSel(idx);
    return () => timers.current.forEach(clearTimeout);
  }, [id, initialAgent]);

  const code = useMemo(() => (agents.length ? generateAgentCode(fw, agents) : ""), [fw, agents]);
  const framework = FRAMEWORKS.find((f) => f.id === fw)!;
  const a = agents[sel];

  const update = (patch: Partial<AgentConfig>) => {
    setAgents((xs) => xs.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
    setSaved(false);
    clearTimeout(timers.current[0]);
    timers.current[0] = setTimeout(() => setSaved(true), 900);
  };

  const addAgent = () => {
    const n = agents.length + 1;
    setAgents((xs) => [...xs, { id: `agent-${n}`, name: `Reviewer ${n}`, role: "Checks the previous step's output for mistakes before it reaches a person", tools: [], model: "gpt-4.1-mini", instructions: "Check the previous step's output for mistakes. Fix small issues, flag big ones.", memory: false, approval: false, pii: true, maxCost: 0.02, temperature: 0 }]);
    setSel(agents.length); setTab("configure");
  };
  const removeAgent = (i: number) => {
    if (agents.length <= 1) return;
    setAgents((xs) => xs.filter((_, j) => j !== i));
    setSel((s) => Math.max(0, s >= i ? s - 1 : s));
  };

  const run = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setSpans([]); setOutput(null); setRunning(true); setTab("test");
    let t = 250; const plan2: Span[] = [];
    agents.forEach((ag, ai) => {
      plan2.push({ id: `${ai}-a`, agent: ai, kind: "agent", label: ag.name, ms: 0, status: "running" });
      plan2.push({ id: `${ai}-l`, agent: ai, kind: "llm", label: `${ag.model} · reasoning`, ms: 380 + ai * 90, tokens: 640 + ai * 210, status: "running" });
      ag.tools.slice(0, 2).forEach((tl, ti) => plan2.push({ id: `${ai}-t${ti}`, agent: ai, kind: "tool", label: tl, ms: 220 + ti * 140, status: "running", detail: toolDetail(tl) }));
      if (ag.approval) plan2.push({ id: `${ai}-h`, agent: ai, kind: "tool", label: "Human approval (auto-approved in test)", ms: 300, status: "running" });
    });
    plan2.forEach((s) => {
      timers.current.push(setTimeout(() => setSpans((xs) => [...xs, s]), t));
      t += s.kind === "agent" ? 120 : s.ms;
      timers.current.push(setTimeout(() => setSpans((xs) => xs.map((x) => (x.id === s.id ? { ...x, status: "ok" } : x.kind === "agent" && x.agent === s.agent && s.kind !== "agent" ? x : x))), t));
    });
    agents.forEach((_, ai) => {
      const last = plan2.filter((s) => s.agent === ai).reduce((acc, s) => acc + (s.kind === "agent" ? 120 : s.ms), 0);
      const start = plan2.slice(0, plan2.findIndex((s) => s.agent === ai)).reduce((acc, s) => acc + (s.kind === "agent" ? 120 : s.ms), 250);
      timers.current.push(setTimeout(() => setSpans((xs) => xs.map((x) => (x.id === `${ai}-a` ? { ...x, status: "ok", ms: last } : x))), start + last));
    });
    timers.current.push(setTimeout(() => { setRunning(false); setOutput(finalOutput(plan!, input)); }, t + 200));
  };
  const stop = () => { timers.current.forEach(clearTimeout); setRunning(false); setSpans((xs) => xs.map((x) => ({ ...x, status: "ok" }))); };

  if (!plan || !a) return <div className="flex h-dvh items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>;

  const totalMs = spans.filter((s) => s.kind !== "agent").reduce((acc, s) => acc + s.ms, 0);
  const totalTok = spans.reduce((acc, s) => acc + (s.tokens ?? 0), 0);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-elev px-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/p/${plan.slug}`} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Back to project"><ArrowLeft className="h-4 w-4" /></Link>
          <LogoMark className="hidden h-6 w-6 shrink-0 sm:block" />
          <Link href={`/p/${plan.slug}`} className="hidden truncate text-[13px] text-text-3 hover:text-text-2 sm:block">{plan.name}</Link>
          <span className="hidden text-text-3 sm:block">/</span>
          <span className="truncate text-[13px] font-medium">Agents</span>
          <span className={cn("ml-1 hidden items-center gap-1 text-[11px] md:inline-flex", saved ? "text-text-3" : "text-accent")}>
            {saved ? <><Check className="h-3 w-3" /> Saved</> : <><Loader2 className="h-3 w-3 animate-spin" /> Saving</>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setFwOpen((o) => !o)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 text-[12.5px] hover:border-line-strong" aria-haspopup="listbox" aria-expanded={fwOpen}>
              <span className="text-text-3 hidden sm:inline">Framework</span> <span className="font-medium">{framework.name}</span> <ChevronDown className="h-3.5 w-3.5 text-text-3" />
            </button>
            <AnimatePresence>
              {fwOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFwOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} role="listbox"
                    className="absolute right-0 top-10 z-50 w-[300px] overflow-hidden rounded-xl border border-line-strong bg-surface p-1 shadow-2xl">
                    <div className="px-2.5 pb-1 pt-2 text-[11px] text-text-3">Same agents, exported to any framework. Switch anytime.</div>
                    {FRAMEWORKS.map((f) => (
                      <button key={f.id} role="option" aria-selected={f.id === fw} onClick={() => { setFw(f.id); setFwOpen(false); }} className={cn("flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2", f.id === fw && "bg-surface-2")}>
                        <span className="mt-0.5 flex h-4 w-4 items-center justify-center">{f.id === fw && <Check className="h-3.5 w-3.5 text-accent" />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between text-[13px] font-medium">{f.name}<span className="rounded bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text-3">{f.lang === "Python" ? "py" : "ts"}</span></span>
                          <span className="block text-[11.5px] text-text-3">{f.blurb}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button onClick={running ? stop : run} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium", running ? "border border-line bg-surface-2 text-text" : "bg-accent text-accent-ink hover:brightness-110")}>
            {running ? <><Square className="h-3 w-3 fill-current" /> Stop</> : <><Play className="h-3.5 w-3.5 fill-current" /> <span className="hidden sm:inline">Test run</span><span className="sm:hidden">Run</span></>}
          </button>
        </div>
      </header>

      {/* Flow */}
      <div className="shrink-0 border-b border-line bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:18px_18px]">
        <div className="no-scrollbar flex items-center gap-0 overflow-x-auto px-3 py-4 sm:px-6 sm:py-5">
          <FlowNode kind="trigger" label="Trigger" sub="New input" />
          {agents.map((ag, i) => {
            const st = spans.find((s) => s.id === `${i}-a`);
            return (
              <div key={ag.id + i} className="flex items-center">
                <Edge active={!!st} />
                <button onClick={() => { setSel(i); if (tab === "test" && !running) setTab("configure"); }} className={cn("group relative w-[168px] shrink-0 rounded-xl border bg-elev p-3 text-left transition-all", i === sel ? "border-accent/60 shadow-[0_0_0_3px_rgba(212,255,63,0.08)]" : "border-line hover:border-line-strong")}>
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", i === sel ? "bg-accent text-accent-ink" : "bg-surface-2 text-text-2")}><Bot className="h-3.5 w-3.5" /></span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{ag.name}</span>
                    {st && (st.status === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> : <Check className="h-3.5 w-3.5 text-ok" />)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[10.5px] text-text-3">
                    <span className="truncate">{ag.model}</span><span>·</span><span>{ag.tools.length} tools</span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {ag.memory && <Badge icon={Brain} label="Memory" />}
                    {ag.approval && <Badge icon={UserCheck} label="Approval" />}
                    {ag.pii && <Badge icon={Shield} label="PII" />}
                  </div>
                </button>
              </div>
            );
          })}
          <Edge active={!!output} />
          <FlowNode kind="output" label="Output" sub={output ? "Delivered" : "App + inbox"} done={!!output} />
          <button onClick={addAgent} className="ml-4 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 text-xs text-text-3 hover:border-accent/50 hover:text-text">
            <Plus className="h-3.5 w-3.5" /> Add agent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-line px-2 sm:px-4">
        {([["configure", "Configure", SlidersHorizontal], ["code", "Code", Code2], ["test", "Test & trace", Zap]] as const).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("relative inline-flex h-11 items-center gap-1.5 px-2.5 text-[13px]", tab === k ? "text-text" : "text-text-3 hover:text-text-2")}>
            <I className="h-3.5 w-3.5" /> {l}
            {k === "test" && running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
            {tab === k && <motion.span layoutId="agent-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
        {tab === "code" && <span className="ml-auto hidden font-mono text-[11px] text-text-3 sm:block">{framework.file}</span>}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "configure" && (
          <motion.div key={`cfg-${sel}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <label className="text-[11px] uppercase tracking-wider text-text-3">Agent {sel + 1} of {agents.length}</label>
                  <input value={a.name} onChange={(e) => update({ name: e.target.value })} className="focus-ring mt-1 w-full rounded-md bg-transparent text-2xl font-semibold tracking-tight outline-none" aria-label="Agent name" />
                </div>
                {agents.length > 1 && <button onClick={() => removeAgent(sel)} className="mt-5 rounded-lg px-2 py-1 text-xs text-text-3 hover:bg-surface-2 hover:text-danger">Remove</button>}
              </div>
              <Field label="Instructions" hint="Plain English. This is the agent's job description.">
                <textarea value={a.instructions} onChange={(e) => update({ instructions: e.target.value })} rows={4} className="focus-ring w-full resize-none rounded-xl border border-line bg-elev px-3.5 py-3 text-[13.5px] leading-relaxed outline-none focus:border-line-strong" />
              </Field>
              <Field label="Tools" hint="What this agent is allowed to touch. Nothing else.">
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set([...a.tools, ...integrationCatalog.slice(0, 10)])].map((t) => {
                    const on = a.tools.includes(t);
                    return (
                      <button key={t} onClick={() => update({ tools: on ? a.tools.filter((x) => x !== t) : [...a.tools, t] })} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors", on ? "border-accent/40 bg-accent-soft text-text" : "border-line text-text-3 hover:border-line-strong hover:text-text-2")}>
                        {on ? <Check className="h-3 w-3 text-accent" /> : <Plus className="h-3 w-3" />} {t}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Hands off to">
                <div className="rounded-xl border border-line bg-elev px-3.5 py-3 text-[13px] text-text-2">
                  {agents[sel + 1] ? <>Passes <span className="font-mono text-[12px] text-code">{"{ result, confidence }"}</span> to <button onClick={() => setSel(sel + 1)} className="font-medium text-text underline decoration-line-strong underline-offset-4 hover:decoration-accent">{agents[sel + 1].name}</button></> : <>Last step. Output goes to the app and the review queue.</>}
                </div>
              </Field>
            </div>
            <aside className="space-y-4">
              <Panel title="Model">
                <select value={a.model} onChange={(e) => update({ model: e.target.value })} className="focus-ring h-9 w-full rounded-lg border border-line bg-bg px-2.5 text-[13px] outline-none">
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <div className="mt-3 flex items-center justify-between text-[12px] text-text-3"><span>Creativity</span><span className="font-mono">{a.temperature.toFixed(1)}</span></div>
                <input type="range" min={0} max={1} step={0.1} value={a.temperature} onChange={(e) => update({ temperature: +e.target.value })} className="mt-1.5 w-full accent-[#d4ff3f]" aria-label="Temperature" />
                <div className="flex justify-between text-[10.5px] text-text-3"><span>Precise</span><span>Creative</span></div>
              </Panel>
              <Panel title="Guardrails">
                <Toggle icon={Shield} label="Redact personal data" sub="Emails, phones, IDs masked in logs" on={a.pii} onChange={(v) => update({ pii: v })} />
                <Toggle icon={UserCheck} label="Ask a person first" sub="Pauses before anything leaves the app" on={a.approval} onChange={(v) => update({ approval: v })} />
                <Toggle icon={Brain} label="Remember past runs" sub="Project memory, 30 days" on={a.memory} onChange={(v) => update({ memory: v })} />
                <div className="mt-3 border-t border-line pt-3">
                  <div className="flex items-center justify-between text-[12.5px]"><span className="inline-flex items-center gap-1.5 text-text-2"><CircleDollarSign className="h-3.5 w-3.5" /> Max cost per run</span><span className="font-mono text-text">${a.maxCost.toFixed(2)}</span></div>
                  <input type="range" min={0.01} max={0.5} step={0.01} value={a.maxCost} onChange={(e) => update({ maxCost: +e.target.value })} className="mt-2 w-full accent-[#d4ff3f]" aria-label="Max cost" />
                </div>
              </Panel>
            </aside>
          </motion.div>
        )}

        {tab === "code" && (
          <motion.div key={`code-${fw}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-[#0d0d0f]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-[#0d0d0f]/95 px-4 py-2 text-[11.5px] text-text-3 backdrop-blur">
              <span>Generated from your agents. Edits here sync back to Configure.</span>
              <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2 hover:text-text">
                {copied ? <><Check className="h-3.5 w-3.5 text-ok" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="overflow-x-auto py-3 font-mono text-[12.5px] leading-[1.7]">
              {code.split("\n").map((l, i) => (
                <div key={i} className="flex px-4 hover:bg-white/[0.02]"><span className="w-9 shrink-0 select-none pr-4 text-right text-text-3/60">{i + 1}</span><span className="whitespace-pre">{highlight(l)}</span></div>
              ))}
            </pre>
          </motion.div>
        )}

        {tab === "test" && (
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Field label="Test input" hint="Runs against sandbox copies of your tools. Nothing is sent.">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} className="focus-ring w-full resize-none rounded-xl border border-line bg-elev px-3.5 py-3 text-[13.5px] leading-relaxed outline-none focus:border-line-strong" />
              </Field>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={running ? stop : run} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium", running ? "border border-line bg-surface-2" : "bg-accent text-accent-ink hover:brightness-110")}>
                  {running ? <><Square className="h-3 w-3 fill-current" /> Stop</> : <><Play className="h-3.5 w-3.5 fill-current" /> Run {agents.length} agents</>}
                </button>
                <button onClick={() => plan && setInput(sampleInput(plan))} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] text-text-3 hover:bg-surface-2 hover:text-text"><RotateCcw className="h-3.5 w-3.5" /> Reset sample</button>
              </div>
              <AnimatePresence>
                {output && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl border border-ok/30 bg-ok/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-ok"><Check className="h-3.5 w-3.5" /> Output</div>
                    <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-text-2">{output}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-[11px] text-text-3">
                      <span>{(totalMs / 1000).toFixed(2)}s</span><span>{totalTok.toLocaleString()} tokens</span><span>${(totalTok * 0.000004).toFixed(4)}</span><span>0 guardrail blocks</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-text-2">Trace</span>
                {spans.length > 0 && <span className="font-mono text-[11px] text-text-3">{spans.length} spans</span>}
              </div>
              {spans.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2"><Zap className="h-4 w-4 text-text-3" /></span>
                  <p className="mt-3 text-[13.5px] font-medium">No runs yet</p>
                  <p className="mt-1 max-w-[260px] text-[12.5px] text-text-3">Run the flow to see each agent, model call and tool call, with timing and cost.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-line bg-elev">
                  <AnimatePresence initial={false}>
                    {spans.map((s) => (
                      <motion.div key={s.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-b border-line last:border-0">
                        <div className={cn("flex items-center gap-2.5 px-3 py-2 text-[12.5px]", s.kind !== "agent" && "pl-9")}>
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                            {s.status === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> : s.kind === "agent" ? <Bot className="h-3.5 w-3.5 text-text-2" /> : s.kind === "llm" ? <Sparkles className="h-3.5 w-3.5 text-[#a996ff]" /> : <Wrench className="h-3.5 w-3.5 text-code" />}
                          </span>
                          <span className={cn("min-w-0 flex-1 truncate", s.kind === "agent" ? "font-medium" : "text-text-2")}>{s.label}{s.detail && <span className="ml-2 font-mono text-[11px] text-text-3">{s.detail}</span>}</span>
                          {s.tokens && <span className="hidden font-mono text-[10.5px] text-text-3 sm:inline">{s.tokens} tok</span>}
                          <span className="w-12 text-right font-mono text-[10.5px] text-text-3">{s.status === "ok" && s.ms ? `${s.ms}ms` : ""}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function toolDetail(t: string) {
  const m: Record<string, string> = { Gmail: "draft.create", HubSpot: "contacts.get", Salesforce: "opportunity.get", Slack: "chat.post", Notion: "pages.query", Zendesk: "tickets.get", "Google Calendar": "events.list", Postgres: "SELECT … LIMIT 50", Apollo: "people.enrich", LinkedIn: "profile.get", Stripe: "invoices.list" };
  return m[t] ?? "call";
}

function finalOutput(p: Plan, input: string) {
  const s = (p.prompt + " " + p.agents.map((a) => a.name).join(" ")).toLowerCase();
  if (/crm|sales|call|follow/.test(s)) return "Drafted follow-up to Priya Nair (waiting for your approval):\n\n\"Thanks for the time today, Priya. As promised, here's the Brightline case study - they cut onboarding time by 40% in their first quarter. Happy to put together a Q4 pilot at a price that works next to HubSpot. Does Thursday work for a 20-minute call?\"\n\nDeal score: 78 (up 6) · Next step: send case study";
  if (/support|ticket/.test(s)) return "Category: Billing · Priority: High · Sentiment: Frustrated\n\nSuggested reply: \"Sorry about the double charge. I've refunded the duplicate payment (3-5 business days) and sent a login link to your email so you can grab the invoice.\"\n\nAdded to this week's theme: \"Duplicate charges after plan change\" (7 tickets).";
  return `Done. Processed: "${input.slice(0, 80)}${input.length > 80 ? "…" : ""}"\n\nSummary ready in the app, 1 item flagged for review.`;
}

function FlowNode({ kind, label, sub, done }: { kind: "trigger" | "output"; label: string; sub: string; done?: boolean }) {
  return (
    <div className={cn("flex h-[74px] w-[112px] shrink-0 flex-col justify-center rounded-xl border px-3", kind === "trigger" ? "border-line bg-surface" : done ? "border-ok/40 bg-ok/[0.05]" : "border-line bg-surface")}>
      <div className="flex items-center gap-1.5 text-[12.5px] font-medium">{kind === "trigger" ? <Zap className="h-3.5 w-3.5 text-warn" /> : done ? <Check className="h-3.5 w-3.5 text-ok" /> : <Square className="h-3 w-3 text-text-3" />} {label}</div>
      <div className="mt-0.5 text-[11px] text-text-3">{sub}</div>
    </div>
  );
}

function Edge({ active }: { active: boolean }) {
  return (
    <div className="relative mx-1 h-px w-8 shrink-0 bg-line-strong sm:w-10">
      {active && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35 }} className="absolute inset-0 origin-left bg-accent" />}
      <span className={cn("absolute -right-0.5 -top-[3px] h-[7px] w-[7px] rotate-45 border-r border-t", active ? "border-accent" : "border-line-strong")} />
    </div>
  );
}

function Badge({ icon: I, label }: { icon: typeof Brain; label: string }) {
  return <span title={label} className="inline-flex h-5 items-center gap-1 rounded-md bg-surface-2 px-1.5 text-[10px] text-text-3"><I className="h-2.5 w-2.5" />{label}</span>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"><span className="text-[13px] font-medium">{label}</span>{hint && <span className="text-[11.5px] text-text-3 sm:text-right">{hint}</span>}</div>
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-line bg-elev p-4"><div className="mb-3 text-[12px] font-medium text-text-2">{title}</div>{children}</div>;
}

function Toggle({ icon: I, label, sub, on, onChange }: { icon: typeof Brain; label: string; sub: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-start gap-2.5 rounded-lg py-2 text-left">
      <I className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-3" />
      <span className="min-w-0 flex-1"><span className="block text-[12.5px] text-text">{label}</span><span className="block text-[11px] text-text-3">{sub}</span></span>
      <span className={cn("relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-accent" : "bg-surface-2 border border-line")}>
        <motion.span layout className={cn("absolute top-0.5 h-4 w-4 rounded-full", on ? "right-0.5 bg-accent-ink" : "left-0.5 bg-text-3")} />
      </span>
    </button>
  );
}

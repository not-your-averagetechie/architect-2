"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, ArrowUp, Bot, Check, ChevronDown, Code2, ExternalLink, FileCode2, GitBranch, Loader2, Monitor, MousePointer2,
  Paperclip, RotateCw, Rocket, Share2, Smartphone, Sparkles, Square, Tablet, Undo2, Folder, Terminal, Circle, History,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { LensToggle, type Lens } from "@/components/ui/lens-toggle";
import { Badge, Kbd } from "@/components/ui/button";
import { AppPreview } from "@/components/workspace/app-preview";
import { makePlan, PLAN_KEY, type Plan } from "@/lib/plan";
import { generateFiles, type FileNode } from "@/lib/codegen";
import { projects } from "@/lib/data";
import { setLens as persistLens } from "@/app/actions";
import { cn } from "@/lib/utils";

type Step = { id: string; label: string; detail: string[]; stage: number };
const STEPS: Step[] = [
  { id: "plan", label: "Locking the plan", detail: ["plan.md committed"], stage: 0 },
  { id: "schema", label: "Creating the database", detail: ["3 tables", "row-level security on"], stage: 0 },
  { id: "ui", label: "Building the UI", detail: ["layout + navigation", "pages scaffolded"], stage: 1 },
  { id: "content", label: "Filling in pages", detail: ["tables, metrics, empty states"], stage: 2 },
  { id: "agents", label: "Creating agents", detail: ["tools wired", "hand-offs connected"], stage: 3 },
  { id: "test", label: "Testing and fixing", detail: ["14 checks passed", "1 issue auto-fixed"], stage: 3 },
];

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; text: string; changes?: string[]; files?: number; streaming?: boolean }
  | { id: string; role: "build" };

export function Workspace({ id, initialLens, build, viewerName }: { id: string; initialLens: Lens; build: boolean; viewerName: string }) {
  const existing = projects.find((p) => p.id === id);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [lens, setLensState] = useState<Lens>(initialLens);
  const [stepIdx, setStepIdx] = useState(build ? 0 : STEPS.length);
  const [paused, setPaused] = useState(false);
  const [page, setPage] = useState(0);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectMode, setSelectMode] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [activeFile, setActiveFile] = useState<string>("plan.md");
  const [reloadKey, setReloadKey] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  // load plan
  useEffect(() => {
    let p: Plan | null = null;
    try { const raw = sessionStorage.getItem(PLAN_KEY(id)); if (raw) p = JSON.parse(raw); } catch {}
    if (!p) { p = makePlan(existing?.description ?? id.replace(/-/g, " ")); if (existing) p = { ...p, name: existing.name, slug: existing.id, summary: existing.description }; }
    setPlan(p);
    setMsgs(build
      ? [{ id: "u0", role: "user", text: p.prompt }, { id: "a0", role: "ai", text: `Plan approved. Building ${p.name} now: ${p.pages.length} pages, ${p.agents.length} agents, ${p.integrations.length} integrations. You can keep chatting while I work.` }, { id: "b0", role: "build" }]
      : [{ id: "a0", role: "ai", text: `Welcome back to ${p.name}. Last change was deployed ${existing?.updated ?? "recently"}. What should we work on?` }]);
  }, [id, build, existing]);

  // build ticker
  const building = stepIdx < STEPS.length;
  useEffect(() => {
    if (!building || paused || !plan) return;
    const t = setTimeout(() => setStepIdx((s) => s + 1), 1300);
    return () => clearTimeout(t);
  }, [stepIdx, building, paused, plan]);
  useEffect(() => {
    if (build && plan && stepIdx === STEPS.length) {
      setMsgs((m) => m.some((x) => x.id === "done") ? m : [...m, { id: "done", role: "ai", text: `${plan.name} is ready in preview. Click around, or try "Select" to point at anything you want changed.`, changes: [`${plan.pages.length} pages`, `${plan.agents.length} agents`, "Tests passing"], files: 8 + plan.pages.length + plan.agents.length }]);
    }
  }, [stepIdx, build, plan]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, stepIdx]);

  const stage = building ? (stepIdx === 0 ? 0 : STEPS[stepIdx - 1].stage) : 3;
  const files = useMemo(() => (plan ? generateFiles(plan) : []), [plan]);

  const changeLens = (l: Lens) => { setLensState(l); void persistLens(l); };

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || !plan) return;
    setInput("");
    setSelectMode(false);
    const uid = `u${Date.now()}`;
    setMsgs((m) => [...m, { id: uid, role: "user", text: t }]);
    setThinking(true);
    setTimeout(() => {
      const reply = respond(t, plan);
      const aid = `a${Date.now()}`;
      setMsgs((m) => [...m, { id: aid, role: "ai", text: "", streaming: true, changes: reply.changes, files: reply.files }]);
      setThinking(false);
      let i = 0;
      const iv = setInterval(() => {
        i += 3;
        setMsgs((m) => m.map((x) => (x.id === aid && x.role === "ai" ? { ...x, text: reply.text.slice(0, i), streaming: i < reply.text.length } : x)));
        if (i >= reply.text.length) { clearInterval(iv); setReloadKey((k) => k + 1); }
      }, 16);
    }, 900);
  };

  if (!plan) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>;

  const status = building ? (paused ? "Paused" : "Building") : "Preview ready";
  const initials = viewerName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-elev px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/home" className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Home"><ArrowLeft className="h-4 w-4" /></Link>
          <LogoMark className="h-6 w-6" />
          <span className="truncate text-[13px] font-medium">{plan.name}</span>
          <button className="hidden items-center gap-1 rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-text-3 hover:text-text-2 sm:inline-flex"><GitBranch className="h-3 w-3" /> {build ? "main" : "feat/outreach-queue"} <ChevronDown className="h-3 w-3" /></button>
          <span className={cn("ml-1 hidden items-center gap-1.5 text-[11px] lg:inline-flex", building ? "text-accent" : "text-ok")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", building ? "animate-pulse bg-accent" : "bg-ok")} /> {status}
          </span>
        </div>
        <LensToggle value={lens} onChange={changeLens} size="sm" />
        <div className="flex items-center justify-end gap-2">
          <div className="mr-1 hidden -space-x-1.5 md:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-elev bg-accent text-[10px] font-semibold text-accent-ink">{initials}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-elev bg-code text-[10px] font-semibold text-bg" title="Rahul (developer) is in the code lens">RK</span>
          </div>
          <button className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-text-2 hover:bg-surface-2 hover:text-text md:inline-flex"><History className="h-3.5 w-3.5" /> History</button>
          <button className="hidden h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[13px] hover:bg-surface-2 sm:inline-flex"><Share2 className="h-3.5 w-3.5" /> Share</button>
          <Link href={`/p/${plan.slug}/deploy`} className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium", building ? "pointer-events-none bg-surface-2 text-text-3" : "bg-accent text-accent-ink hover:brightness-110")}><Rocket className="h-3.5 w-3.5" /> Deploy</Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* LEFT: chat (describe) or files (code) */}
        <AnimatePresence mode="wait" initial={false}>
          {lens === "code" && (
            <motion.aside key="files" initial={{ width: 0, opacity: 0 }} animate={{ width: 232, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="shrink-0 overflow-hidden border-r border-line bg-elev">
              <FileTree files={files} active={activeFile} onOpen={setActiveFile} />
            </motion.aside>
          )}
        </AnimatePresence>

        <section className={cn("flex min-w-0 flex-col border-r border-line bg-bg", lens === "describe" ? "w-[420px] shrink-0" : "order-last w-[340px] shrink-0 border-l border-r-0")}>
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-4 text-xs text-text-3">
            <span className="inline-flex items-center gap-1.5">{lens === "describe" ? <><Sparkles className="h-3.5 w-3.5 text-accent" /> Chat</> : <><Bot className="h-3.5 w-3.5 text-code" /> Pair</>}</span>
            <span>{lens === "describe" ? "Changes apply to preview instantly" : "Proposes diffs, you accept"}</span>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {msgs.map((m) => m.role === "build" ? (
              <BuildCard key={m.id} stepIdx={stepIdx} paused={paused} onPause={() => setPaused((p) => !p)} />
            ) : m.role === "user" ? (
              <div key={m.id} className="ml-10 rounded-2xl rounded-tr-md bg-surface-2 px-3.5 py-2.5 text-[13.5px] leading-relaxed">{m.text}</div>
            ) : (
              <div key={m.id} className="text-[13.5px] leading-relaxed">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs text-text-3"><Sparkles className="h-3 w-3 text-accent" /> Architect</div>
                <p className={cn("text-text-2", m.streaming && "caret")}>{m.text}</p>
                {!m.streaming && m.changes && (
                  <div className="mt-2.5 rounded-xl border border-line bg-elev p-3">
                    <div className="space-y-1">{m.changes.map((c) => <div key={c} className="flex items-center gap-2 text-xs text-text-2"><Check className="h-3.5 w-3.5 text-ok" /> {c}</div>)}</div>
                    <div className="mt-2.5 flex items-center gap-2 border-t border-line pt-2.5 text-xs">
                      <button onClick={() => changeLens("code")} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-code hover:bg-surface-2"><Code2 className="h-3.5 w-3.5" /> View diff · {m.files} files</button>
                      <button className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-text-3 hover:bg-surface-2 hover:text-text"><Undo2 className="h-3.5 w-3.5" /> Undo</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {thinking && <div className="flex items-center gap-2 text-xs text-text-3"><Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Thinking…</div>}
            {!building && msgs.length < 5 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestFor(plan).map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-text-2 hover:border-line-strong hover:text-text">{s}</button>)}
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          <div className="shrink-0 p-3">
            <div className="rounded-2xl border border-line-strong bg-elev p-1.5 focus-within:border-accent/40">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={2}
                placeholder={lens === "describe" ? "Ask for a change, e.g. make the table sortable" : "Ask your pair, e.g. add retries to the scorer agent"} className="block w-full resize-none bg-transparent px-2.5 py-2 text-[13.5px] placeholder:text-text-3 focus:outline-none" />
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-0.5">
                  <button className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Attach"><Paperclip className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setSelectMode((s) => !s); if (lens === "code") changeLens("describe"); }} className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs", selectMode ? "bg-[#7c5cff]/15 text-[#a996ff]" : "text-text-3 hover:bg-surface-2 hover:text-text")}><MousePointer2 className="h-3.5 w-3.5" /> Select</button>
                </div>
                <button onClick={() => send()} disabled={!input.trim()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink disabled:bg-surface-2 disabled:text-text-3" aria-label="Send"><ArrowUp className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: preview (describe) or editor (code) */}
        <section className="flex min-w-0 flex-1 flex-col bg-[#0d0d0f]">
          {lens === "describe" ? (
            <>
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-3">
                <div className="flex items-center rounded-lg border border-line bg-bg p-0.5">
                  {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, I]) => (
                    <button key={d} onClick={() => setDevice(d)} className={cn("rounded-md p-1.5", device === d ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")} aria-label={d}><I className="h-3.5 w-3.5" /></button>
                  ))}
                </div>
                <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-bg px-2.5 font-mono text-[11.5px] text-text-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" /> <span className="truncate">{plan.slug}-preview.architect.app/{(plan.pages[page] ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
                </div>
                <button onClick={() => setReloadKey((k) => k + 1)} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Reload"><RotateCw className="h-3.5 w-3.5" /></button>
                <button className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Open in new tab"><ExternalLink className="h-3.5 w-3.5" /></button>
              </div>
              <div className="relative min-h-0 flex-1 overflow-auto p-4">
                {selectMode && <div className="absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-full bg-[#7c5cff] px-3 py-1 text-xs text-white shadow-lg">Click anything in the preview to change it · <Kbd className="border-white/30 bg-white/10 text-white">Esc</Kbd></div>}
                <motion.div key={reloadKey} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} layout
                  className={cn("mx-auto h-full overflow-hidden rounded-xl border border-line-strong shadow-2xl transition-[max-width] duration-300", device === "desktop" ? "max-w-none" : device === "tablet" ? "max-w-[820px]" : "max-w-[390px]")}
                  onKeyDown={(e) => e.key === "Escape" && setSelectMode(false)}>
                  <AppPreview plan={plan} stage={stage} page={page} onPage={setPage} device={device} selectMode={selectMode}
                    onSelect={(label) => { setSelectMode(false); setInput(`Change the ${label}: `); inputRef.current?.focus(); }} />
                </motion.div>
              </div>
              <AgentStrip plan={plan} live={stage >= 3} />
            </>
          ) : (
            <CodePane file={files.find((f) => f.path === activeFile) ?? files[0]} building={building} stepIdx={stepIdx} />
          )}
        </section>
      </div>
    </div>
  );
}

function BuildCard({ stepIdx, paused, onPause }: { stepIdx: number; paused: boolean; onPause: () => void }) {
  const done = stepIdx >= STEPS.length;
  const pct = Math.round((Math.min(stepIdx, STEPS.length) / STEPS.length) * 100);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-elev">
      <div className="flex items-center justify-between px-3.5 pt-3">
        <div className="flex items-center gap-2 text-[13px] font-medium">{done ? <Check className="h-4 w-4 text-ok" /> : <Loader2 className={cn("h-4 w-4 text-accent", !paused && "animate-spin")} />} {done ? "Build complete" : paused ? "Paused" : "Building"}</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-text-3">{pct}%</span>
          {!done && <button onClick={onPause} className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-text-2 hover:text-text">{paused ? <><Circle className="h-2.5 w-2.5" /> Resume</> : <><Square className="h-2.5 w-2.5" /> Pause</>}</button>}
        </div>
      </div>
      <div className="mx-3.5 mt-2.5 h-1 overflow-hidden rounded-full bg-surface-2"><motion.div className="h-full bg-accent" animate={{ width: `${pct}%` }} /></div>
      <ol className="space-y-1.5 px-3.5 py-3">
        {STEPS.map((s, i) => {
          const st = i < stepIdx ? "done" : i === stepIdx ? "active" : "todo";
          return (
            <li key={s.id} className={cn("text-xs", st === "todo" && "opacity-40")}>
              <div className="flex items-center gap-2">
                {st === "done" ? <Check className="h-3.5 w-3.5 text-ok" /> : st === "active" ? <Loader2 className={cn("h-3.5 w-3.5 text-accent", !paused && "animate-spin")} /> : <span className="h-3.5 w-3.5 rounded-full border border-line-strong" />}
                <span className={st === "active" ? "text-text" : "text-text-2"}>{s.label}</span>
              </div>
              {st !== "todo" && <div className="ml-[22px] mt-0.5 font-mono text-[10.5px] text-text-3">{s.detail.join(" · ")}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AgentStrip({ plan, live }: { plan: Plan; live: boolean }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2 overflow-x-auto border-t border-line px-3">
      <span className="shrink-0 text-[11px] uppercase tracking-wider text-text-3">Agents</span>
      {plan.agents.map((a, i) => (
        <Link key={a.id + i} href={`/p/${plan.slug}/agents?agent=${a.id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-elev px-2 py-1 text-xs text-text-2 hover:border-line-strong hover:text-text">
          <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-ok" : "bg-text-3")} /> {a.name}
          {i < plan.agents.length - 1 && <span className="ml-1 text-text-3">→</span>}
        </Link>
      ))}
      <Link href={`/p/${plan.slug}/agents`} className="ml-auto shrink-0 text-xs text-text-3 hover:text-text-2">Open agent builder →</Link>
    </div>
  );
}

function FileTree({ files, active, onOpen }: { files: FileNode[]; active: string; onOpen: (p: string) => void }) {
  const groups = files.reduce<Record<string, FileNode[]>>((acc, f) => { const d = f.path.includes("/") ? f.path.split("/")[0] : ""; (acc[d] ??= []).push(f); return acc; }, {});
  return (
    <div className="w-[232px] py-2 font-mono text-[12px]">
      <div className="px-3 pb-2 text-[10.5px] uppercase tracking-wider text-text-3" style={{ fontFamily: "var(--font-geist-sans)" }}>Files</div>
      {Object.entries(groups).sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b))).map(([dir, fs]) => (
        <div key={dir || "root"}>
          {dir && <div className="flex items-center gap-1.5 px-3 py-1 text-text-2"><Folder className="h-3.5 w-3.5 text-text-3" /> {dir}</div>}
          {fs.map((f) => {
            const name = dir ? f.path.slice(dir.length + 1) : f.path;
            return (
              <button key={f.path} onClick={() => onOpen(f.path)} className={cn("flex w-full items-center gap-1.5 py-1 pr-3 text-left", dir ? "pl-7" : "pl-3", active === f.path ? "bg-code/10 text-code" : "text-text-2 hover:bg-surface-2")}>
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-text-3" /> <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CodePane({ file, building, stepIdx }: { file: FileNode; building: boolean; stepIdx: number }) {
  const lines = file.content.split("\n");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line px-3 font-mono text-[12px] text-text-2">
        <FileCode2 className="h-3.5 w-3.5 text-code" /> {file.path}
        <Badge tone="code" className="ml-2">{file.lang}</Badge>
        <span className="ml-auto text-[11px] text-text-3" style={{ fontFamily: "var(--font-geist-sans)" }}>Edits here show up in the Describe lens too</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto py-3 font-mono text-[12.5px] leading-6">
        {lines.map((l, i) => (
          <div key={i} className="flex hover:bg-white/[0.02]">
            <span className="w-12 shrink-0 select-none pr-4 text-right text-text-3">{i + 1}</span>
            <code className="whitespace-pre text-text-2">{highlight(l)}</code>
          </div>
        ))}
      </pre>
      <div className="h-36 shrink-0 border-t border-line bg-bg">
        <div className="flex h-8 items-center gap-3 border-b border-line px-3 text-[11px] text-text-3"><span className="inline-flex items-center gap-1.5 text-text-2"><Terminal className="h-3.5 w-3.5" /> Terminal</span><span>Problems 0</span><span>Build logs</span></div>
        <div className="space-y-0.5 overflow-auto px-3 py-2 font-mono text-[11.5px] text-text-3">
          <div>$ architect dev</div>
          {STEPS.slice(0, Math.min(stepIdx, STEPS.length)).map((s) => <div key={s.id}><span className="text-ok">✓</span> {s.label.toLowerCase()} <span className="text-text-3">({s.detail[0]})</span></div>)}
          {building ? <div className="text-accent">… {STEPS[stepIdx]?.label.toLowerCase()}</div> : <div className="text-ok">ready on :3000 · hot reload on</div>}
        </div>
      </div>
    </div>
  );
}

function highlight(line: string) {
  const parts = line.split(/(\/\/.*$|"[^"]*"|`[^`]*`|\b(?:import|from|export|const|default|async|function|return|await|create|table|primary|key|text|uuid)\b|#.*$)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^(\/\/|#)/.test(p)) return <span key={i} className="text-text-3">{p}</span>;
    if (/^["`]/.test(p)) return <span key={i} className="text-accent/90">{p}</span>;
    if (/^(import|from|export|const|default|async|function|return|await|create|table|primary|key|text|uuid)$/.test(p)) return <span key={i} className="text-code">{p}</span>;
    return <span key={i}>{p}</span>;
  });
}

function suggestFor(plan: Plan) {
  return [`Add a filter to ${plan.pages[0] ?? "the dashboard"}`, "Make it work on mobile", `Explain how ${plan.agents[0]?.name ?? "the agents"} works`];
}

function respond(t: string, plan: Plan): { text: string; changes: string[]; files: number } {
  const l = t.toLowerCase();
  if (l.startsWith("explain")) return { text: `${plan.agents[0]?.name} runs first: ${plan.agents[0]?.role.toLowerCase()}. It hands structured output to ${plan.agents[1]?.name ?? "the UI"}, which ${plan.agents[1]?.role.toLowerCase() ?? "shows the result"}. Each run is logged in Agent activity, and you can replay any run from the Agents screen.`, changes: ["No code changed"], files: 0 };
  if (l.includes("mobile")) return { text: "Done. The sidebar collapses into a bottom tab bar under 640px, tables become stacked cards, and tap targets are at least 44px. Switch the preview to phone size to check it.", changes: ["Responsive layout", "Bottom tab bar on mobile", "Stacked table cards"], files: 4 };
  if (l.includes("filter") || l.includes("sort")) return { text: "Added a filter bar above the table with status, owner and date range. Filters are saved in the URL so you can share a filtered view with a link.", changes: ["Filter bar component", "URL-synced filters", "Empty state for no results"], files: 3 };
  return { text: `Got it. I updated ${plan.pages[0] ?? "the page"} and kept everything else the same. Have a look in the preview; if it's not quite right, tell me what to adjust or hit Undo.`, changes: ["Updated UI", "Kept existing data and agents"], files: 2 };
}

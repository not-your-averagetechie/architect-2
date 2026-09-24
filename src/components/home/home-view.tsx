"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Paperclip, GitBranch, LayoutTemplate, Sparkles, Bot, Clock, Search, Lock, Globe, X, ChevronDown, Code2, Mic } from "lucide-react";
import { LensToggle, type Lens } from "@/components/ui/lens-toggle";
import { Badge, Kbd } from "@/components/ui/button";
import { projects, templates, suggestions, repos } from "@/lib/data";
import { setLens as persistLens } from "@/app/actions";
import { cn } from "@/lib/utils";

type Mode = "prompt" | "import" | "template";

export function HomeView({ name, lens: initialLens, goal }: { name: string; lens: Lens; goal?: string }) {
  const router = useRouter();
  const [lens, setLens] = useState<Lens>(initialLens);
  const [mode, setMode] = useState<Mode>("prompt");
  const [prompt, setPrompt] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const first = name === "Guest" ? "" : `, ${name.split(" ")[0]}`;
  const [greet, setGreet] = useState("Hello");
  useEffect(() => { const h = new Date().getHours(); setGreet(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"); }, []);

  useEffect(() => { ta.current?.focus(); }, []);
  useEffect(() => {
    if (!ta.current) return;
    ta.current.style.height = "0px";
    ta.current.style.height = Math.min(ta.current.scrollHeight, 240) + "px";
  }, [prompt]);

  const changeLens = (l: Lens) => { setLens(l); void persistLens(l); };
  const submit = () => {
    if (!prompt.trim()) return;
    router.push(`/p/new/plan?prompt=${encodeURIComponent(prompt.trim())}&lens=${lens}`);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] glow" />
      <header className="relative flex h-14 items-center justify-between border-b border-line px-6">
        <div className="text-[13px] text-text-3">Home</div>
        <div className="flex items-center gap-3">
          <button className="focus-ring hidden h-8 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-text-3 hover:text-text-2 sm:inline-flex">
            <Search className="h-3.5 w-3.5" /> Search or jump to <Kbd>⌘K</Kbd>
          </button>
          <LensToggle value={lens} onChange={changeLens} size="sm" />
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 pb-24 pt-16">
        <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center text-4xl font-semibold tracking-[-0.03em]">
          {greet}{first}. What are we building?
        </motion.h1>
        <p className="mt-3 text-center text-text-2">
          {lens === "describe" ? "Describe it in plain English. You'll review a plan before anything gets built." : "Start from a prompt or a repo. You'll land in the code lens with the agent as your pair."}
        </p>

        {/* Composer */}
        <div className="mt-10 rounded-2xl border border-line-strong bg-elev p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] focus-within:border-accent/40">
          <div className="flex gap-1 px-2 pt-1">
            {([
              ["prompt", "New from prompt", Sparkles],
              ["import", "Import repo", GitBranch],
              ["template", "From template", LayoutTemplate],
            ] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => { setMode(id); if (id === "import") setImportOpen(true); if (id === "template") document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" }); }}
                className={cn("focus-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors", mode === id ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <textarea
            ref={ta}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) { e.preventDefault(); submit(); } }}
            placeholder={lens === "describe" ? "e.g. A client portal where my agency's customers can track campaigns and ask an AI about results" : "e.g. Next.js + Postgres app with a LangGraph agent that triages GitHub issues and labels them"}
            rows={3}
            className="block w-full resize-none bg-transparent px-3 py-3 text-[15px] leading-relaxed placeholder:text-text-3 focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Attach files" title="Attach docs, screenshots or a Figma link"><Paperclip className="h-4 w-4" /></button>
              <button className="rounded-lg p-2 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Voice" title="Dictate"><Mic className="h-4 w-4" /></button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-text-3 hover:bg-surface-2 hover:text-text">
                <Bot className="h-3.5 w-3.5" /> Agents: Lyzr <ChevronDown className="h-3 w-3" />
              </button>
              {lens === "code" && (
                <button className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-code hover:bg-surface-2">
                  <Code2 className="h-3.5 w-3.5" /> Next.js · TypeScript <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-text-3 sm:block">Plan first, then build</span>
              <button onClick={submit} disabled={!prompt.trim()} aria-label="Create plan"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink transition-all hover:brightness-110 disabled:bg-surface-2 disabled:text-text-3">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(goal ? [...suggestions].sort((a) => (a.toLowerCase().includes("internal") && goal === "Internal tool" ? -1 : 0)) : suggestions).map((s) => (
            <button key={s} onClick={() => { setPrompt(s); ta.current?.focus(); }} className="focus-ring rounded-full border border-line px-3 py-1.5 text-xs text-text-2 transition-colors hover:border-line-strong hover:text-text">
              {s}
            </button>
          ))}
        </div>

        {/* Recent */}
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="text-[15px] font-semibold">Recent projects</h2>
            <Link href="/projects" className="text-xs text-text-3 hover:text-text-2">View all</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Link key={p.id} href={`/p/${p.id}`} className="focus-ring group rounded-2xl border border-line bg-elev p-4 transition-colors hover:border-line-strong">
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
                <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-text-2">{p.description}</p>
                {p.repo && <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-text-3"><GitBranch className="h-3 w-3" /> {p.repo}</div>}
              </Link>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="mt-16 scroll-mt-8">
          <div className="flex items-end justify-between">
            <h2 className="text-[15px] font-semibold">Start from a template</h2>
            <Link href="/templates" className="text-xs text-text-3 hover:text-text-2">Browse all</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {templates.map((t) => (
              <button key={t.id} onClick={() => router.push(`/p/new/plan?template=${t.id}&prompt=${encodeURIComponent(t.blurb)}&lens=${lens}`)}
                className="focus-ring rounded-2xl border border-line p-4 text-left transition-colors hover:border-line-strong hover:bg-elev">
                <div className="text-sm font-medium">{t.name}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-text-2">{t.blurb}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">{t.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                  <span className="text-[11px] text-text-3">{t.uses} uses</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>{importOpen && <ImportDialog onClose={() => { setImportOpen(false); setMode("prompt"); }} onPick={(r) => router.push(`/p/new/import?repo=${encodeURIComponent(r)}`)} />}</AnimatePresence>
    </div>
  );
}

function ImportDialog({ onClose, onPick }: { onClose: () => void; onPick: (repo: string) => void }) {
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const list = repos.filter((r) => r.name.includes(q.toLowerCase()));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-elev">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <div className="text-[15px] font-semibold">Import a GitHub repository</div>
            <div className="text-xs text-text-3">We&apos;ll detect the stack, map the agents and keep working on a new branch.</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your repositories" className="focus-ring h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-text-3" />
          </div>
          <div className="mt-2 max-h-72 overflow-auto">
            {list.map((r) => (
              <button key={r.name} onClick={() => onPick(r.name)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-surface-2">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[13px]">{r.private ? <Lock className="h-3 w-3 text-text-3" /> : <Globe className="h-3 w-3 text-text-3" />} {r.name}</div>
                  <div className="mt-0.5 text-[11px] text-text-3">{r.stack} · updated {r.updated}</div>
                </div>
                <span className="text-xs text-text-3">Import →</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 border-t border-line p-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="or paste a public repo URL" className="focus-ring h-9 flex-1 rounded-lg border border-line bg-surface px-3 font-mono text-xs placeholder:text-text-3" />
          <button disabled={!url} onClick={() => onPick(url.replace(/^https?:\/\/github.com\//, ""))} className="h-9 rounded-lg bg-accent px-3 text-xs font-medium text-accent-ink disabled:opacity-40">Import</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bot, CornerDownLeft, FolderKanban, GitBranch, Home, LayoutTemplate, Rocket, Search, Settings, Sparkles, Code2, MessageSquareText } from "lucide-react";
import { projects, templates } from "@/lib/data";
import { cn } from "@/lib/utils";

type Item = { id: string; group: string; label: string; hint?: string; icon: typeof Home; run: () => void };

export function openPalette() { window.dispatchEvent(new Event("arch:palette")); }

export function CommandPalette() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("arch:palette", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("arch:palette", onOpen); };
  }, []);
  useEffect(() => { if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEffect(() => setOpen(false), [path]);

  const go = (href: string) => () => { setOpen(false); router.push(href); };
  const projectId = path.match(/^\/p\/([^/]+)/)?.[1];
  const items: Item[] = useMemo(() => {
    const base: Item[] = [];
    if (q.trim().length > 3) base.push({ id: "build", group: "Build", label: `Build "${q.trim()}"`, hint: "Plan first", icon: Sparkles, run: go(`/p/new/plan?prompt=${encodeURIComponent(q.trim())}`) });
    if (projectId && projectId !== "new") base.push(
      { id: "p-agents", group: "This project", label: "Open agent builder", icon: Bot, run: go(`/p/${projectId}/agents`) },
      { id: "p-deploy", group: "This project", label: "Deploy", icon: Rocket, run: go(`/p/${projectId}/deploy`) },
      { id: "p-code", group: "This project", label: "Switch to Code lens", icon: Code2, run: go(`/p/${projectId}?lens=code`) },
      { id: "p-desc", group: "This project", label: "Switch to Describe lens", icon: MessageSquareText, run: go(`/p/${projectId}?lens=describe`) },
    );
    base.push(
      { id: "new", group: "Go to", label: "New project", icon: Sparkles, hint: "N", run: go("/home") },
      { id: "home", group: "Go to", label: "Home", icon: Home, run: go("/home") },
      { id: "projects", group: "Go to", label: "Projects", icon: FolderKanban, run: go("/projects") },
      { id: "templates", group: "Go to", label: "Templates", icon: LayoutTemplate, run: go("/templates") },
      { id: "agents", group: "Go to", label: "Agent library", icon: Bot, run: go("/agents") },
      { id: "deploys", group: "Go to", label: "Deployments", icon: Rocket, run: go("/deployments") },
      { id: "settings", group: "Go to", label: "Settings", icon: Settings, run: go("/settings") },
      { id: "import", group: "Go to", label: "Import a GitHub repo", icon: GitBranch, run: go("/p/new/import?repo=acme%2Fsupport-copilot") },
      ...projects.map((p) => ({ id: `proj-${p.id}`, group: "Projects", label: p.name, hint: p.status, icon: FolderKanban, run: go(`/p/${p.id}`) })),
      ...templates.map((t) => ({ id: `tpl-${t.id}`, group: "Templates", label: t.name, hint: t.tags[0], icon: LayoutTemplate, run: go(`/p/new/plan?template=${t.id}&prompt=${encodeURIComponent(t.blurb)}`) })),
    );
    const s = q.toLowerCase().trim();
    return s ? base.filter((i) => i.id === "build" || (i.label + " " + i.group + " " + (i.hint ?? "")).toLowerCase().includes(s)) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, projectId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") { e.preventDefault(); items[idx]?.run(); }
  };

  let lastGroup = "";
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-3 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <motion.div initial={{ y: -8, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, scale: 0.98 }} transition={{ duration: 0.15 }} onClick={(e) => e.stopPropagation()}
            role="dialog" aria-label="Command palette" className="w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 text-text-3" />
              <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKeyDown} placeholder="Search, jump, or describe something to build…" className="h-13 min-w-0 flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-text-3" />
              <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-text-3 sm:block">ESC</kbd>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-1.5">
              {items.length === 0 && <div className="px-3 py-10 text-center text-[13px] text-text-3">Nothing found. Keep typing to build it instead.</div>}
              {items.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null; lastGroup = it.group;
                const I = it.icon;
                return (
                  <div key={it.id}>
                    {header && <div className="px-3 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wider text-text-3">{header}</div>}
                    <button onMouseEnter={() => setIdx(i)} onClick={it.run} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px]", i === idx ? "bg-surface-2 text-text" : "text-text-2")}>
                      <I className={cn("h-4 w-4 shrink-0", it.id === "build" ? "text-accent" : "text-text-3")} />
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      {it.hint && <span className="text-[11.5px] capitalize text-text-3">{it.hint}</span>}
                      {i === idx && <CornerDownLeft className="h-3.5 w-3.5 text-text-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-text-3">
              <span>↑↓ to move</span><span>↵ to open</span><span className="ml-auto inline-flex items-center gap-1">Type an idea <ArrowRight className="h-3 w-3" /> build it</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

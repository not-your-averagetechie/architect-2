"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Globe, History, Lock, MessageCircle, RotateCcw, Users, X, Code2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export type Version = { id: string; label: string; who: string; lens: "describe" | "code"; when: string; files: number };

export function HistoryDrawer({ open, onClose, versions, onRestore }: { open: boolean; onClose: () => void; versions: Version[]; onRestore: (v: Version) => void }) {
  const [restoring, setRestoring] = useState<string | null>(null);
  const [current, setCurrent] = useState(versions[0]?.id);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/50" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-line-strong bg-elev" role="dialog" aria-label="Version history">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <span className="inline-flex items-center gap-2 text-[14px] font-medium"><History className="h-4 w-4 text-text-3" /> Version history</span>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <p className="border-b border-line px-4 py-2.5 text-[12px] text-text-3">Every change is saved, from chat or from code. Restoring creates a new version, so nothing is lost.</p>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {versions.map((v, i) => (
                <div key={v.id} className="group relative flex gap-3 rounded-xl px-2.5 py-3 hover:bg-surface">
                  <div className="flex flex-col items-center">
                    <span className={cn("mt-1 h-2.5 w-2.5 rounded-full border-2", v.id === current ? "border-accent bg-accent" : "border-line-strong bg-elev")} />
                    {i < versions.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[13px] font-medium">{v.label}{v.id === current && <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] text-accent">Current</span>}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-text-3">
                      {v.lens === "code" ? <Code2 className="h-3 w-3 text-code" /> : <MessageSquareText className="h-3 w-3 text-accent" />}
                      {v.who} · {v.when} · {v.files} files
                    </div>
                  </div>
                  {v.id !== current && (
                    <button onClick={() => { setRestoring(v.id); setTimeout(() => { setCurrent(v.id); setRestoring(null); onRestore(v); }, 700); }}
                      className="self-center rounded-lg border border-line px-2 py-1 text-[11.5px] text-text-2 opacity-100 hover:bg-surface-2 hover:text-text sm:opacity-0 sm:group-hover:opacity-100">
                      {restoring === v.id ? "Restoring…" : <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Restore</span>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function ShareDialog({ open, onClose, slug, onComment }: { open: boolean; onClose: () => void; slug: string; onComment: () => void }) {
  const [audience, setAudience] = useState<"workspace" | "link">("workspace");
  const [copied, setCopied] = useState(false);
  const url = `https://${slug}-preview.architect.app${audience === "link" ? "?s=7Fq2" : ""}`;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share"
            className="w-full max-w-md rounded-t-2xl border border-line-strong bg-elev p-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Share preview</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-[12.5px] text-text-3">People see the live preview and can leave comments pinned to the screen. They can't edit.</p>
            <div className="mt-4 space-y-2">
              {([["workspace", "Workspace only", "Demo workspace · 3 members", Users], ["link", "Anyone with the link", "No sign-in needed", Globe]] as const).map(([k, l, s, I]) => (
                <button key={k} onClick={() => setAudience(k)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left", audience === k ? "border-accent/50 bg-accent-soft" : "border-line hover:border-line-strong")}>
                  <I className="h-4 w-4 text-text-2" />
                  <span className="flex-1"><span className="block text-[13px] font-medium">{l}</span><span className="block text-[11.5px] text-text-3">{s}</span></span>
                  {audience === k && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-bg p-1.5 pl-3">
              {audience === "workspace" ? <Lock className="h-3.5 w-3.5 shrink-0 text-text-3" /> : <Globe className="h-3.5 w-3.5 shrink-0 text-text-3" />}
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-text-2">{url}</span>
              <button onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-text px-3 text-[12.5px] font-medium text-bg">
                {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            </div>
            <button onClick={() => { onClose(); onComment(); }} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-[13px] text-text-2 hover:bg-surface-2 hover:text-text">
              <MessageCircle className="h-4 w-4" /> Try comment mode yourself
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type Pin = { id: number; x: number; y: number; text: string; who: string };

export function PinLayer({ active, pins, onAdd, onExit }: { active: boolean; pins: Pin[]; onAdd: (p: Pin) => void; onExit: () => void }) {
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [openPin, setOpenPin] = useState<number | null>(null);
  return (
    <div className={cn("absolute inset-0 z-20", active ? "cursor-crosshair" : "pointer-events-none")}
      onClick={(e) => { if (!active || draft) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setDraft({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); setText(""); }}>
      {active && <div className="pointer-events-auto absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#ff7a45] px-3 py-1 text-xs text-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <MessageCircle className="h-3.5 w-3.5" /> Click anywhere to comment <button onClick={onExit} className="ml-1 rounded-full bg-white/20 px-1.5">Done</button>
      </div>}
      {pins.map((p) => (
        <div key={p.id} className="pointer-events-auto absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setOpenPin(openPin === p.id ? null : p.id)} className="-translate-x-1/2 -translate-y-full rounded-full rounded-bl-none bg-[#ff7a45] px-2 py-0.5 text-[11px] font-semibold text-white shadow-lg">{p.id}</button>
          {openPin === p.id && <div className="absolute left-2 top-1 w-56 rounded-xl border border-line-strong bg-surface p-3 text-[12.5px] shadow-2xl"><div className="text-[11px] text-text-3">{p.who} · just now</div><div className="mt-1 text-text">{p.text}</div></div>}
        </div>
      ))}
      {draft && (
        <div className="pointer-events-auto absolute" style={{ left: `${draft.x}%`, top: `${draft.y}%` }} onClick={(e) => e.stopPropagation()}>
          <span className="block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff7a45]" />
          <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; onAdd({ id: pins.length + 1, x: draft.x, y: draft.y, text: text.trim(), who: "You" }); setDraft(null); }}
            className="absolute left-2 top-2 w-60 rounded-xl border border-line-strong bg-surface p-2 shadow-2xl">
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Leave a comment…" className="h-8 w-full rounded-lg bg-bg px-2.5 text-[12.5px] outline-none" />
            <div className="mt-2 flex justify-end gap-1.5">
              <button type="button" onClick={() => setDraft(null)} className="h-7 rounded-md px-2 text-[12px] text-text-3 hover:text-text">Cancel</button>
              <button className="h-7 rounded-md bg-[#ff7a45] px-2.5 text-[12px] font-medium text-white">Comment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

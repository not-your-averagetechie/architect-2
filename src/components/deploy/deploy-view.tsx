"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Copy, ExternalLink, Eye, EyeOff, GitBranch, GitCommit, Globe, KeyRound, Loader2, Lock, Plus, Rocket, RotateCcw, Shield, TriangleAlert, GitPullRequest } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { makePlan, PLAN_KEY, type Plan } from "@/lib/plan";
import { projects } from "@/lib/data";

type Env = { key: string; value: string; secret: boolean; scope: "All" | "Production" | "Preview"; missing?: boolean };
type Deploy = { id: string; env: "Production" | "Preview"; branch: string; commit: string; msg: string; when: string; status: "ready" | "building" | "failed" | "rolled-back"; dur: string; current?: boolean };

const LOG = [
  "Cloning repository (main @ {sha})",
  "Installing dependencies · 214 packages · cache hit",
  "Type check passed",
  "Running agent evals · 14/14 passed",
  "Building pages · {pages} routes",
  "Provisioning agents on Lyzr runtime · {agents} agents",
  "Uploading build output · 2.1 MB",
  "Assigning domain {domain}",
];

function loadPlan(id: string): Plan {
  try { const raw = sessionStorage.getItem(PLAN_KEY(id)); if (raw) return JSON.parse(raw); } catch {}
  const ex = projects.find((p) => p.id === id);
  const p = makePlan(ex?.description ?? id.replace(/-/g, " "));
  return ex ? { ...p, name: ex.name, slug: ex.id, summary: ex.description } : { ...p, slug: id };
}

export function DeployView({ id }: { id: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [envs, setEnvs] = useState<Env[]>([]);
  const [target, setTarget] = useState<"Production" | "Preview">("Production");
  const [phase, setPhase] = useState<"idle" | "deploying" | "done">("idle");
  const [logIdx, setLogIdx] = useState(0);
  const [history, setHistory] = useState<Deploy[]>([]);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [domain, setDomain] = useState("");
  const [rollback, setRollback] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = loadPlan(id);
    setPlan(p);
    setDomain(`${p.slug}.architect.app`);
    const integ = p.integrations.map((i) => i.toUpperCase().replace(/[^A-Z]+/g, "_"));
    setEnvs([
      { key: "DATABASE_URL", value: "postgres://arch:••••@db.architect.app/" + p.slug.replace(/-/g, "_"), secret: true, scope: "All" },
      { key: "LYZR_API_KEY", value: "lyz_live_8f2c0a91d4e7", secret: true, scope: "All" },
      ...integ.map((k, i) => ({ key: `${k}_API_KEY`, value: i === integ.length - 1 ? "" : `sk_${k.toLowerCase().slice(0, 4)}_61be20`, secret: true, scope: "Production" as const, missing: i === integ.length - 1 })),
      { key: "NEXT_PUBLIC_APP_NAME", value: p.name, secret: false, scope: "All" },
    ]);
    setHistory([
      { id: "d4", env: "Production", branch: "main", commit: "a91f3c2", msg: "Add follow-up queue filters", when: "2h ago", status: "ready", dur: "48s", current: true },
      { id: "d3", env: "Preview", branch: "feat/outreach-queue", commit: "7c02be1", msg: "Draft outreach queue page", when: "5h ago", status: "ready", dur: "52s" },
      { id: "d2", env: "Production", branch: "main", commit: "e4d8a10", msg: "Scorer agent: add confidence threshold", when: "Yesterday", status: "ready", dur: "45s" },
      { id: "d1", env: "Preview", branch: "fix/pii", commit: "19bb7f4", msg: "Mask phone numbers in logs", when: "2d ago", status: "failed", dur: "31s" },
    ]);
    return () => { if (t.current) clearInterval(t.current); };
  }, [id]);

  const missing = envs.filter((e) => e.missing && !e.value);
  const checks = plan ? [
    { label: "Build passes", ok: true },
    { label: "14 agent evals passing", ok: true },
    { label: "Guardrails on for every agent", ok: true },
    { label: missing.length ? `${missing.length} secret missing` : "All secrets set", ok: missing.length === 0 },
  ] : [];

  const deploy = () => {
    if (!plan) return;
    setPhase("deploying"); setLogIdx(0);
    let i = 0;
    t.current = setInterval(() => {
      i++; setLogIdx(i);
      if (i >= LOG.length) {
        clearInterval(t.current!);
        setPhase("done");
        const sha = Math.random().toString(16).slice(2, 9);
        setHistory((h) => [{ id: `d${Date.now()}`, env: target, branch: target === "Production" ? "main" : "feat/preview", commit: sha, msg: "Deploy from Architect", when: "Just now", status: "ready", dur: `${(LOG.length * 0.6).toFixed(0)}s`, current: target === "Production" }, ...h.map((d) => (target === "Production" ? { ...d, current: false } : d))]);
      }
    }, 600);
  };

  const doRollback = (d: Deploy) => {
    setRollback(d.id);
    setTimeout(() => {
      setHistory((h) => h.map((x) => ({ ...x, current: x.id === d.id, status: x.current && x.id !== d.id ? "rolled-back" : x.status })));
      setRollback(null);
    }, 1200);
  };

  if (!plan) return <div className="flex h-dvh items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>;
  const url = target === "Production" ? domain : `${plan.slug}-git-feat-preview.architect.app`;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-line bg-bg/85 px-2 backdrop-blur sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/p/${plan.slug}`} className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Back to project"><ArrowLeft className="h-4 w-4" /></Link>
          <LogoMark className="hidden h-6 w-6 shrink-0 sm:block" />
          <Link href={`/p/${plan.slug}`} className="hidden truncate text-[13px] text-text-3 hover:text-text-2 sm:block">{plan.name}</Link>
          <span className="hidden text-text-3 sm:block">/</span>
          <span className="text-[13px] font-medium">Deploy</span>
        </div>
        <Link href={`/p/${plan.slug}/agents`} className="rounded-lg px-2.5 py-1.5 text-[13px] text-text-3 hover:bg-surface-2 hover:text-text">Agents</Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ship {plan.name}</h1>
            <p className="mt-1.5 text-[14px] text-text-2">One click. No GitHub needed - connect a repo later if your team wants PRs.</p>
          </div>

          {/* Deploy card */}
          <section className="overflow-hidden rounded-2xl border border-line bg-elev">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="grid flex-1 grid-cols-2 rounded-xl border border-line bg-bg p-1 text-[13px] sm:max-w-[280px]">
                {(["Production", "Preview"] as const).map((e) => (
                  <button key={e} onClick={() => phase !== "deploying" && setTarget(e)} className={cn("h-9 rounded-lg font-medium", target === e ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")}>{e}</button>
                ))}
              </div>
              <div className="min-w-0 flex-1 text-[12.5px] text-text-3">
                <div className="flex items-center gap-1.5 truncate font-mono text-text-2"><Globe className="h-3.5 w-3.5 shrink-0" /> {url}</div>
                <div className="mt-0.5">{target === "Production" ? "Your live app. Rollback is one click." : "A private link to share for feedback."}</div>
              </div>
              <button onClick={deploy} disabled={phase === "deploying"} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-8px_rgba(212,255,63,0.5)] hover:brightness-110 disabled:opacity-60">
                {phase === "deploying" ? <><Loader2 className="h-4 w-4 animate-spin" /> Deploying</> : <><Rocket className="h-4 w-4" /> Deploy to {target.toLowerCase()}</>}
              </button>
            </div>
            {missing.length > 0 && phase === "idle" && (
              <div className="flex items-start gap-2 border-t border-line bg-warn/[0.05] px-4 py-3 text-[12.5px] text-warn sm:px-5">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span><span className="font-mono">{missing[0].key}</span> is empty. The app will deploy, but that integration stays off until you add it below.</span>
              </div>
            )}
            <AnimatePresence>
              {phase !== "idle" && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden border-t border-line bg-[#0d0d0f]">
                  <div className="space-y-1 p-4 font-mono text-[12px] sm:px-5">
                    {LOG.slice(0, logIdx + 1).map((l, i) => {
                      const line = l.replace("{sha}", "a91f3c2").replace("{pages}", String(plan.pages.length + 2)).replace("{agents}", String(plan.agents.length)).replace("{domain}", url);
                      const doneLine = i < logIdx || phase === "done";
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
                          {doneLine ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" /> : <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-accent" />}
                          <span className={doneLine ? "text-text-3" : "text-text"}>{line}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                  {phase === "done" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 border-t border-line bg-ok/[0.05] p-4 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok/15"><Check className="h-4 w-4 text-ok" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-medium">{target === "Production" ? "You're live" : "Preview ready"}</div>
                        <div className="truncate font-mono text-[12px] text-text-3">https://{url}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard?.writeText(`https://${url}`); setCopied(true); setTimeout(() => setCopied(false), 1400); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2">{copied ? <><Check className="h-3.5 w-3.5 text-ok" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}</button>
                        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-text px-3 text-[13px] font-medium text-bg"><ExternalLink className="h-3.5 w-3.5" /> Open</button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Env vars */}
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Secrets & environment</h2>
                <p className="text-[12.5px] text-text-3">Encrypted at rest. Agents only see the keys their tools need.</p>
              </div>
              <button onClick={() => setEnvs((e) => [...e, { key: "NEW_VARIABLE", value: "", secret: true, scope: "All" }])} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 text-[12.5px] text-text-2 hover:bg-surface-2 hover:text-text"><Plus className="h-3.5 w-3.5" /> Add</button>
            </div>
            <div className="overflow-hidden rounded-xl border border-line">
              {envs.map((e, i) => (
                <div key={i} className={cn("flex flex-col gap-2 border-b border-line px-3.5 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-3", e.missing && !e.value && "bg-warn/[0.03]")}>
                  <div className="flex min-w-0 items-center gap-2 sm:w-[240px]">
                    {e.secret ? <Lock className="h-3.5 w-3.5 shrink-0 text-text-3" /> : <KeyRound className="h-3.5 w-3.5 shrink-0 text-text-3" />}
                    <input value={e.key} onChange={(ev) => setEnvs((xs) => xs.map((x, j) => (j === i ? { ...x, key: ev.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") } : x)))} className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] outline-none" aria-label="Variable name" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <input value={e.value} placeholder={e.missing ? "Paste key to turn this integration on" : "Value"} type={e.secret && !reveal[i] ? "password" : "text"}
                      onChange={(ev) => setEnvs((xs) => xs.map((x, j) => (j === i ? { ...x, value: ev.target.value } : x)))}
                      className={cn("h-8 min-w-0 flex-1 rounded-lg border bg-bg px-2.5 font-mono text-[12px] outline-none focus:border-line-strong", e.missing && !e.value ? "border-warn/40" : "border-line")} aria-label={`${e.key} value`} />
                    {e.secret && <button onClick={() => setReveal((r) => ({ ...r, [i]: !r[i] }))} className="rounded-md p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label={reveal[i] ? "Hide" : "Show"}>{reveal[i] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>}
                    <span className="w-[76px] shrink-0 rounded-md bg-surface-2 px-1.5 py-1 text-center text-[10.5px] text-text-3">{e.scope}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section>
            <h2 className="mb-3 text-[15px] font-semibold">Deployments</h2>
            <div className="overflow-hidden rounded-xl border border-line">
              {history.map((d) => (
                <div key={d.id} className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-0">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", d.status === "ready" ? "bg-ok" : d.status === "failed" ? "bg-danger" : d.status === "rolled-back" ? "bg-text-3" : "animate-pulse bg-accent")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="truncate font-medium">{d.msg}</span>
                      {d.current && <span className="shrink-0 rounded-md bg-ok/15 px-1.5 py-0.5 text-[10.5px] font-medium text-ok">Current</span>}
                      {d.status === "failed" && <span className="shrink-0 rounded-md bg-danger/15 px-1.5 py-0.5 text-[10.5px] text-danger">Failed</span>}
                      {d.status === "rolled-back" && <span className="shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-text-3">Rolled back</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-text-3">
                      <span>{d.env}</span>
                      <span className="inline-flex items-center gap-1 font-mono"><GitBranch className="h-3 w-3" />{d.branch}</span>
                      <span className="inline-flex items-center gap-1 font-mono"><GitCommit className="h-3 w-3" />{d.commit}</span>
                      <span>{d.when} · {d.dur}</span>
                    </div>
                  </div>
                  {d.env === "Production" && d.status === "ready" && !d.current && (
                    <button onClick={() => doRollback(d)} disabled={!!rollback} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12.5px] text-text-2 hover:bg-surface-2 hover:text-text disabled:opacity-50">
                      {rollback === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} <span className="hidden sm:inline">Roll back</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-elev p-4">
            <div className="mb-3 text-[12px] font-medium text-text-2">Pre-flight checks</div>
            <div className="space-y-2.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[13px]">
                  {c.ok ? <Check className="h-4 w-4 text-ok" /> : <TriangleAlert className="h-4 w-4 text-warn" />}
                  <span className={c.ok ? "text-text-2" : "text-warn"}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-elev p-4">
            <div className="mb-3 text-[12px] font-medium text-text-2">Domain</div>
            <input value={domain} onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""))} className="h-9 w-full rounded-lg border border-line bg-bg px-2.5 font-mono text-[12.5px] outline-none focus:border-line-strong" aria-label="Domain" />
            <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-text-3"><Shield className="h-3 w-3 text-ok" /> {domain.endsWith(".architect.app") ? "Free subdomain · HTTPS included" : "Add a CNAME to cname.architect.app · HTTPS auto-issued"}</div>
          </div>
          <div className="rounded-2xl border border-line bg-elev p-4">
            <div className="mb-1 flex items-center gap-2 text-[13px] font-medium"><GitPullRequest className="h-4 w-4" /> GitHub</div>
            <p className="text-[12.5px] leading-relaxed text-text-3">Optional. Connect a repo and every chat session becomes a branch, every accepted change a commit, every deploy a PR.</p>
            <button className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12.5px] hover:bg-surface-2">Connect repository</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

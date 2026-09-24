"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Bot, Check, FileCode2, GitBranch, KeyRound, Layers, Loader2, Lock, Sparkles, TriangleAlert, Wrench } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { repos } from "@/lib/data";
import { PLAN_KEY, makePlan, slugify } from "@/lib/plan";

const STEPS = ["Cloning repository", "Detecting stack", "Mapping routes and components", "Finding agents and tools", "Checking environment", "Writing architect.json"];

type Analysis = { stack: string[]; routes: string[]; agents: { name: string; file: string; framework: string }[]; env: { key: string; found: boolean }[]; issues: string[]; files: number; loc: string };

function analyse(repo: string): Analysis {
  const r = repos.find((x) => x.name === repo);
  const py = r?.lang === "Python";
  if (py) return {
    stack: ["Python 3.12", r?.stack.split(" · ")[0] ?? "FastAPI", r?.stack.split(" · ")[1] ?? "LangGraph", "Postgres"],
    routes: ["POST /quote", "GET /quotes/{id}", "POST /approve", "GET /health"],
    agents: [{ name: "Pricing planner", file: "agents/planner.py", framework: "LangGraph" }, { name: "Margin checker", file: "agents/margin.py", framework: "LangGraph" }],
    env: [{ key: "OPENAI_API_KEY", found: true }, { key: "DATABASE_URL", found: true }, { key: "STRIPE_SECRET_KEY", found: false }],
    issues: ["No tests for agents/margin.py", "STRIPE_SECRET_KEY used but not set"], files: 86, loc: "7.9k",
  };
  return {
    stack: ["TypeScript", ...(r?.stack.split(" · ") ?? ["Next.js"]), "Tailwind"],
    routes: ["/", "/inbox", "/tickets/[id]", "/settings", "/api/agents/run"],
    agents: [{ name: "Triage", file: "lib/agents/triage.ts", framework: "OpenAI Agents SDK" }, { name: "Reply drafter", file: "lib/agents/reply.ts", framework: "OpenAI Agents SDK" }],
    env: [{ key: "OPENAI_API_KEY", found: true }, { key: "DATABASE_URL", found: true }, { key: "ZENDESK_TOKEN", found: false }],
    issues: ["ZENDESK_TOKEN used in lib/zendesk.ts but not set", "2 components have no mobile styles"], files: 142, loc: "12.4k",
  };
}

export function ImportView({ repo }: { repo: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length;
  const a = analyse(repo);
  const r = repos.find((x) => x.name === repo);

  useEffect(() => {
    if (step >= STEPS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [step]);

  const open = () => {
    const name = repo.split("/")[1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Imported app";
    const base = makePlan(name);
    const slug = slugify(name);
    const plan = { ...base, name, slug, summary: `Imported from ${repo}`, prompt: `Imported from ${repo}`, pages: a.routes.filter((x) => !x.startsWith("/api") && !x.includes("POST") && !x.includes("GET")).map((x) => (x === "/" ? "Home" : x.replace(/^\//, "").replace(/\[.*?\]/, "detail").replace(/\//g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))).slice(0, 4), agents: a.agents.map((x, i) => ({ id: slugify(x.name), name: x.name, role: i === 0 ? "Sorts incoming work and routes it" : "Drafts the response for review", tools: [], model: "gpt-4.1" })) };
    if (plan.pages.length === 0) plan.pages = ["Dashboard", "Detail"];
    sessionStorage.setItem(PLAN_KEY(slug), JSON.stringify(plan));
    router.push(`/p/${slug}?lens=code`);
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/85 px-3 backdrop-blur">
        <Link href="/home" className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
        <LogoMark className="h-6 w-6" />
        <span className="text-[13px] text-text-3">Import</span><span className="text-text-3">/</span>
        <span className="truncate font-mono text-[13px]">{repo}</span>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-center gap-2 text-[12px] text-text-3">
          <GitBranch className="h-3.5 w-3.5" /> main {r?.private && <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5"><Lock className="h-3 w-3" /> Private</span>}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{done ? "Here's what I found" : "Reading your repo…"}</h1>
        <p className="mt-1.5 text-[14px] text-text-2">{done ? "Nothing was changed. Review it, then open the project in either lens." : "Read-only. Your code stays where it is."}</p>

        {!done ? (
          <div className="mt-8 space-y-3 rounded-2xl border border-line bg-elev p-5">
            {STEPS.map((s, i) => (
              <div key={s} className={cn("flex items-center gap-3 text-[14px]", i > step && "opacity-35")}>
                {i < step ? <Check className="h-4 w-4 text-ok" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="h-4 w-4 rounded-full border border-line-strong" />}
                {s}
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[["Files", String(a.files)], ["Lines", a.loc], ["Agents", String(a.agents.length)]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-elev p-3.5"><div className="text-[11.5px] text-text-3">{k}</div><div className="mt-1 text-xl font-semibold">{v}</div></div>
              ))}
            </div>
            <Card icon={Layers} title="Stack">
              <div className="flex flex-wrap gap-1.5">{a.stack.map((s) => <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-text-2">{s}</span>)}</div>
            </Card>
            <Card icon={Bot} title="Agents found" hint="These show up in the agent builder, editable in plain English.">
              {a.agents.map((x) => (
                <div key={x.file} className="flex items-center justify-between gap-3 border-b border-line py-2 text-[13px] last:border-0">
                  <span className="font-medium">{x.name}</span>
                  <span className="truncate font-mono text-[11.5px] text-text-3">{x.file} · {x.framework}</span>
                </div>
              ))}
            </Card>
            <Card icon={FileCode2} title="Routes">
              <div className="flex flex-wrap gap-1.5">{a.routes.map((x) => <span key={x} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-text-2">{x}</span>)}</div>
            </Card>
            <Card icon={KeyRound} title="Environment">
              {a.env.map((e) => (
                <div key={e.key} className="flex items-center justify-between py-1.5 text-[13px]">
                  <span className="font-mono text-[12.5px]">{e.key}</span>
                  {e.found ? <span className="inline-flex items-center gap-1 text-[12px] text-ok"><Check className="h-3.5 w-3.5" /> Found</span> : <span className="inline-flex items-center gap-1 text-[12px] text-warn"><TriangleAlert className="h-3.5 w-3.5" /> Needs a value</span>}
                </div>
              ))}
            </Card>
            <Card icon={Wrench} title="Worth fixing" hint="I can fix these once the project is open.">
              {a.issues.map((x) => <div key={x} className="flex items-start gap-2 py-1 text-[13px] text-text-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />{x}</div>)}
            </Card>
            <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-line bg-bg/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0">
              <Link href="/home" className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-4 text-sm text-text-2 hover:bg-surface-2">Cancel</Link>
              <button onClick={open} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink hover:brightness-110">Open project <ArrowRight className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Card({ icon: I, title, hint, children }: { icon: typeof Bot; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-elev p-4">
      <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"><span className="inline-flex items-center gap-2 text-[13.5px] font-medium"><I className="h-4 w-4 text-text-3" />{title}</span>{hint && <span className="text-[11.5px] text-text-3">{hint}</span>}</div>
      {children}
    </section>
  );
}

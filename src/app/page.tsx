import Link from "next/link";
import { ArrowRight, GitBranch, Sparkles, ShieldCheck, Rocket, Bot, ListChecks } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { HeroDemo } from "@/components/landing/hero-demo";
import { getViewer } from "@/lib/session";

export default async function Landing() {
  const viewer = await getViewer();
  const cta = viewer ? "/home" : "/login";
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 glow" />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-[13px] text-text-2 md:flex">
          <a href="#lenses" className="hover:text-text">How it works</a>
          <a href="#plan" className="hover:text-text">Plan review</a>
          <a href="#ship" className="hover:text-text">Ship</a>
        </nav>
        <Link href={cta} className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg bg-surface-2 border border-line px-3.5 text-[13px] font-medium hover:bg-[#24242a]">
          {viewer ? "Open workspace" : "Sign in"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs text-text-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Now for business users <em className="not-italic text-text-3">and</em> developers
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.035em] md:text-7xl">
            Prompt it. Code it.<br /><span className="text-accent">Ship it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-text-2">
            One project, two lenses. Describe what you need in plain English, or drop into the code. Both edit the same agentic app, and nobody hands anything off.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={cta} className="focus-ring inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[15px] font-medium text-accent-ink shadow-[0_8px_30px_-8px_rgba(212,255,63,0.55)] hover:brightness-110">
              Start building free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={cta} className="focus-ring inline-flex h-12 items-center gap-2 rounded-xl border border-line-strong px-5 text-[15px] text-text hover:bg-surface-2">
              <GitBranch className="h-4 w-4" /> Import a GitHub repo
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <HeroDemo />
        </section>

        <section id="lenses" className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Describe lens", body: "Chat, live preview and plain-English agent cards. Built for the person who owns the problem." },
            { icon: Bot, title: "Code lens", body: "File tree, diffs you accept or reject, terminal and env. Built for the person who owns the system." },
            { icon: GitBranch, title: "Same source of truth", body: "Every change, from a prompt or a keystroke, lands as a commit on the same branch. Flip lenses anytime." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-line bg-elev p-6">
              <f.icon className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-2">{f.body}</p>
            </div>
          ))}
        </section>

        <section id="plan" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid items-center gap-10 rounded-3xl border border-line bg-elev p-8 md:grid-cols-2 md:p-12">
            <div>
              <ListChecks className="h-6 w-6 text-accent" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Approve the plan before a single line is written.</h2>
              <p className="mt-4 leading-relaxed text-text-2">
                Architect turns your prompt into a spec of pages, agents, data and integrations. Edit it like a doc, then build. No more "the AI built the wrong thing."
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-bg p-5 font-mono text-[13px] leading-7 text-text-2">
              <div className="text-text-3"># plan.md · Lead Scout</div>
              <div><span className="text-accent">pages</span>  Dashboard, Lead detail, Outreach queue</div>
              <div><span className="text-accent">agents</span> Prospector → Scorer → Copywriter</div>
              <div><span className="text-accent">data</span>   leads, companies, sequences</div>
              <div><span className="text-accent">tools</span>  Apollo, LinkedIn, Gmail</div>
              <div className="mt-3 flex gap-2 font-sans">
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-ink">Approve & build</span>
                <span className="rounded-md border border-line px-2 py-0.5 text-xs">Edit plan</span>
              </div>
            </div>
          </div>
        </section>

        <section id="ship" className="mx-auto grid max-w-6xl gap-4 px-6 pb-28 md:grid-cols-3">
          {[
            { icon: Rocket, title: "One-click deploys", body: "Preview for every branch, production when you say so, rollback in one click." },
            { icon: GitBranch, title: "GitHub native", body: "Import any repo. Each chat session works on its own branch and opens a PR." },
            { icon: ShieldCheck, title: "Enterprise ready", body: "Roles for business editors and developers, secrets vault, audit trail." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-line p-6">
              <f.icon className="h-5 w-5 text-text-2" />
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-2">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-text-3">
          <span>Architect 2.0 concept, designed and built by Sachin Yadav</span>
          <span>Hiring-assignment prototype · not an official Lyzr product</span>
        </div>
      </footer>
    </div>
  );
}

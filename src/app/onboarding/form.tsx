"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Code2, MessageSquareText, Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { completeOnboarding } from "@/app/actions";
import { cn } from "@/lib/utils";

const lenses = [
  { id: "describe", icon: MessageSquareText, title: "I describe what I want", body: "Chat and live preview first. Code stays out of the way until you ask for it.", tone: "accent" },
  { id: "code", icon: Code2, title: "I write code", body: "Files, diffs and terminal first. Chat becomes a pair programmer.", tone: "code" },
] as const;

const goals = ["Internal tool", "Customer-facing app", "Automation / workflow", "Prototype for a client", "Just exploring"];

export function OnboardingForm({ name }: { name: string }) {
  const [lens, setLens] = useState<"describe" | "code">("describe");
  const [goal, setGoal] = useState<string>("");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 glow" />
      <header className="relative flex h-16 items-center justify-between px-6">
        <Logo />
        <span className="text-xs text-text-3">1 question · you can switch anytime</span>
      </header>
      <form action={completeOnboarding} className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 pb-24">
        <input type="hidden" name="lens" value={lens} />
        <input type="hidden" name="goal" value={goal} />
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold tracking-tight">
          Welcome{name && name !== "Guest" ? `, ${name}` : ""}. How do you like to build?
        </motion.h1>
        <p className="mt-2 text-text-2">This only sets your default lens. Every project has both.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {lenses.map((l) => {
            const active = lens === l.id;
            return (
              <button type="button" key={l.id} onClick={() => setLens(l.id)} aria-pressed={active}
                className={cn("focus-ring relative rounded-2xl border p-5 text-left transition-all",
                  active ? (l.tone === "code" ? "border-code/50 bg-code/5" : "border-accent/50 bg-accent-soft") : "border-line bg-elev hover:border-line-strong")}>
                <l.icon className={cn("h-5 w-5", l.tone === "code" ? "text-code" : "text-accent")} />
                <div className="mt-4 font-medium">{l.title}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-text-2">{l.body}</div>
                {active && <span className={cn("absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full", l.tone === "code" ? "bg-code text-bg" : "bg-accent text-accent-ink")}><Check className="h-3 w-3" /></span>}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="text-sm text-text-2">What are you building first? <span className="text-text-3">(optional)</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {goals.map((g) => (
              <button type="button" key={g} onClick={() => setGoal(goal === g ? "" : g)}
                className={cn("focus-ring rounded-full border px-3.5 py-1.5 text-[13px] transition-colors", goal === g ? "border-text bg-text text-bg" : "border-line text-text-2 hover:border-line-strong hover:text-text")}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-ink hover:brightness-110">
            Continue to workspace <ArrowRight className="h-4 w-4" />
          </button>
          <span className="text-xs text-text-3">Press Enter ↵</span>
        </div>
      </form>
    </div>
  );
}

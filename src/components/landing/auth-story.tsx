"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";

const steps = [
  { k: "Prompt", v: "An inbox agent that files invoices into QuickBooks" },
  { k: "Plan", v: "2 pages · 2 agents · Gmail + QuickBooks" },
  { k: "Build", v: "UI, agents, schema, tests" },
  { k: "Ship", v: "invoice-desk.architect.app" },
];

export function AuthStory() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % (steps.length + 1)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="max-w-md">
      <h2 className="text-4xl font-semibold leading-tight tracking-[-0.03em]">
        From a sentence<br />to a <span className="text-accent">deployed agent app</span>.
      </h2>
      <div className="mt-10 space-y-3">
        {steps.map((s, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <motion.div key={s.k} animate={{ opacity: done || active ? 1 : 0.35 }} className="flex items-center gap-4 rounded-xl border border-line bg-bg/70 px-4 py-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${done ? "border-accent bg-accent text-accent-ink" : "border-line-strong text-text-3"}`}>
                {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> : <span className="text-[10px]">{idx + 1}</span>}
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-text-3">{s.k}</div>
                <div className="text-sm">{s.v}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

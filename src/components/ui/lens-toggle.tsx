"use client";

import { motion } from "motion/react";
import { MessageSquareText, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Lens = "describe" | "code";

export function LensToggle({ value, onChange, size = "md", className }: { value: Lens; onChange: (l: Lens) => void; size?: "sm" | "md"; className?: string }) {
  const items: { id: Lens; label: string; icon: typeof Code2 }[] = [
    { id: "describe", label: "Describe", icon: MessageSquareText },
    { id: "code", label: "Code", icon: Code2 },
  ];
  return (
    <div role="tablist" aria-label="Lens" className={cn("relative inline-flex rounded-xl border border-line bg-bg p-1", className)}>
      {items.map((it) => {
        const active = value === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cn(
              "focus-ring relative z-10 inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active ? (it.id === "code" ? "text-code" : "text-accent") : "text-text-3 hover:text-text-2",
            )}
          >
            {active && (
              <motion.span layoutId="lens-pill" className="absolute inset-0 -z-10 rounded-lg bg-surface-2 border border-line-strong" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
            )}
            <Icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

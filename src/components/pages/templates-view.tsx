"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bot, Users } from "lucide-react";
import { templates } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";

export function TemplatesView() {
  const router = useRouter();
  const tags = ["All", ...Array.from(new Set(templates.flatMap((t) => t.tags)))];
  const [tag, setTag] = useState("All");
  const list = templates.filter((t) => tag === "All" || t.tags.includes(tag));
  return (
    <div>
      <PageHeader title="Templates" sub="Start from something that already works. Everything is editable after." />
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-4 sm:px-8">
        {tags.map((t) => <button key={t} onClick={() => setTag(t)} className={cn("h-8 shrink-0 rounded-full border px-3 text-[12.5px]", tag === t ? "border-accent/40 bg-accent-soft text-text" : "border-line text-text-3 hover:text-text-2")}>{t}</button>)}
      </div>
      <div className="grid gap-3 px-4 pb-10 sm:grid-cols-2 sm:px-8 xl:grid-cols-3">
        {list.map((t, i) => (
          <motion.button key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => router.push(`/p/new/plan?template=${t.id}&prompt=${encodeURIComponent(t.blurb)}`)}
            className="group flex flex-col rounded-2xl border border-line bg-elev text-left transition-colors hover:border-line-strong">
            <div className="relative h-28 overflow-hidden rounded-t-2xl border-b border-line bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:14px_14px]">
              <div className="absolute inset-x-4 top-4 flex items-center gap-1.5">
                {Array.from({ length: t.agents }).map((_, k) => (
                  <div key={k} className="flex items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface"><Bot className="h-3.5 w-3.5 text-accent" /></span>
                    {k < t.agents - 1 && <span className="mx-1 h-px w-5 bg-line-strong" />}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 left-4 right-4 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded-full bg-surface-2" /><div className="h-1.5 w-1/2 rounded-full bg-surface-2" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="text-[14px] font-medium">{t.name}</div>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-text-2">{t.blurb}</p>
              <div className="mt-3 flex items-center justify-between text-[11.5px] text-text-3">
                <span className="flex gap-1">{t.tags.map((x) => <span key={x} className="rounded-md bg-surface-2 px-1.5 py-0.5">{x}</span>)}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {t.uses}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-accent opacity-80 group-hover:opacity-100">Use template <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

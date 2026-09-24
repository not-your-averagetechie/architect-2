"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileCode2, Folder, Globe, Play, Sparkles } from "lucide-react";
import { LensToggle, type Lens } from "@/components/ui/lens-toggle";

const chat = [
  { who: "you", text: "Score every new lead 1-10 and draft a first email for anything above 7." },
  { who: "ai", text: "Added a Scorer agent and an Outreach queue page. Leads above 7 now get a draft in your tone." },
];

const code = `// agents/scorer.ts  ·  generated, then edited by dev
export const scorer = agent({
  name: "Scorer",
  model: "gpt-4.1",
  tools: [apollo.enrich, linkedin.company],
  output: z.object({ score: z.number().min(1).max(10), reason: z.string() }),
});

export const route = when(scorer, (r) => r.score > 7)
  .then(copywriter);`;

export function HeroDemo() {
  const [lens, setLens] = useState<Lens>("describe");
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setLens((l) => (l === "describe" ? "code" : "describe")), 4200);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <div className="relative rounded-2xl border border-line-strong bg-elev shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]/80" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]/80" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]/80" />
          <span className="ml-3 text-[13px] text-text-2">Lead Scout</span>
          <span className="text-[13px] text-text-3">/ main</span>
        </div>
        <LensToggle value={lens} onChange={(l) => { setAuto(false); setLens(l); }} size="sm" />
        <div className="hidden items-center gap-2 text-xs text-text-3 sm:flex">
          <Globe className="h-3.5 w-3.5" /> leadscout.architect.app
        </div>
      </div>

      <div className="grid min-h-[380px] md:grid-cols-[1fr_1.25fr]">
        <div className="border-b border-line p-4 md:border-b-0 md:border-r">
          <AnimatePresence mode="wait">
            {lens === "describe" ? (
              <motion.div key="d" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3 text-left">
                {chat.map((m, i) => (
                  <div key={i} className={m.who === "you" ? "ml-8 rounded-xl rounded-tr-sm bg-surface-2 p-3 text-[13px]" : "mr-4 rounded-xl rounded-tl-sm border border-line p-3 text-[13px] text-text-2"}>
                    {m.who === "ai" && <div className="mb-1.5 flex items-center gap-1.5 text-xs text-accent"><Sparkles className="h-3 w-3" /> Architect</div>}
                    {m.text}
                  </div>
                ))}
                <div className="mr-4 space-y-1.5 rounded-xl border border-line p-3 text-xs text-text-2">
                  {["Updated plan: +1 agent, +1 page", "Scorer agent created", "Outreach queue page built", "Tests passed (14/14)"].map((s) => (
                    <div key={s} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-ok" /> {s}</div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="c" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="text-left font-mono text-[12.5px] text-text-2">
                {[["app", true], ["agents", true], ["scorer.ts", false], ["copywriter.ts", false], ["db", true], ["plan.md", false]].map(([n, dir], i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1 ${n === "scorer.ts" ? "bg-code/10 text-code" : ""} ${i === 2 || i === 3 ? "pl-6" : ""}`}>
                    {dir ? <Folder className="h-3.5 w-3.5 text-text-3" /> : <FileCode2 className="h-3.5 w-3.5 text-text-3" />} {n as string}
                  </div>
                ))}
                <div className="mt-4 rounded-lg border border-line p-3 text-[11.5px]">
                  <div className="text-text-3">$ architect test</div>
                  <div className="text-ok">✓ 14 passed</div>
                  <div className="text-text-3">$ git commit -m &quot;scorer threshold&quot;</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative p-4">
          <AnimatePresence mode="wait">
            {lens === "describe" ? (
              <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full rounded-xl border border-line bg-bg p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Outreach queue</div>
                  <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-accent">3 drafts ready</span>
                </div>
                <div className="mt-4 space-y-2">
                  {[["Priya Nair", "Head of Ops · Fintrail", 9], ["Marco Ruiz", "VP Sales · Loopdesk", 8], ["Aiko Tan", "CTO · Nimbus Health", 8], ["Dev Shah", "Founder · Kettle", 6]].map(([n, r, s]) => (
                    <div key={n as string} className="flex items-center justify-between rounded-lg border border-line bg-elev px-3 py-2.5">
                      <div>
                        <div className="text-[13px] font-medium">{n}</div>
                        <div className="text-xs text-text-3">{r}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm ${(s as number) > 7 ? "text-accent" : "text-text-3"}`}>{s}/10</span>
                        <span className="rounded-md border border-line px-2 py-1 text-[11px] text-text-2">{(s as number) > 7 ? "Review draft" : "Skipped"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.pre key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-auto rounded-xl border border-line bg-bg p-4 text-left font-mono text-[12.5px] leading-6 text-text-2">
                {code.split("\n").map((l, i) => (
                  <div key={i} className={i === 10 ? "bg-ok/10 text-ok" : ""}>
                    <span className="mr-4 inline-block w-4 text-right text-text-3">{i + 1}</span>{l}
                  </div>
                ))}
              </motion.pre>
            )}
          </AnimatePresence>
          <div className="absolute bottom-7 right-7 inline-flex items-center gap-1.5 rounded-lg bg-surface-2/90 px-2.5 py-1.5 text-xs text-text-2 backdrop-blur border border-line">
            <Play className="h-3 w-3 text-accent" /> Same app, {lens === "describe" ? "business view" : "developer view"}
          </div>
        </div>
      </div>
    </div>
  );
}

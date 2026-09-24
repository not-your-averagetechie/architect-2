"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Code2, Copy, CreditCard, KeyRound, MessageSquareText, Plus, User, Users, Building2, LogOut } from "lucide-react";
import { setLens } from "@/app/actions";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";
import type { Viewer } from "@/lib/session";

const TABS = [["profile", "Profile", User], ["workspace", "Workspace", Building2], ["members", "Members", Users], ["keys", "API keys", KeyRound], ["billing", "Billing", CreditCard]] as const;
type TabId = (typeof TABS)[number][0];

export function SettingsView({ viewer }: { viewer: Viewer }) {
  const [tab, setTab] = useState<TabId>("profile");
  const [lens, setL] = useState(viewer.lens);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const pickLens = async (l: "describe" | "code") => { setL(l); await setLens(l); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="grid gap-6 px-4 py-5 sm:px-8 md:grid-cols-[200px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
          {TABS.map(([k, l, I]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px]", tab === k ? "bg-surface-2 text-text" : "text-text-3 hover:text-text-2")}><I className="h-3.5 w-3.5" /> {l}</button>
          ))}
        </nav>
        <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-5 pb-10">
          {tab === "profile" && <>
            <Section title="You">
              <Row label="Name"><input defaultValue={viewer.name} className="h-9 w-full rounded-lg border border-line bg-bg px-3 text-[13px] outline-none focus:border-line-strong" /></Row>
              <Row label="Signed in with"><span className="text-[13px] text-text-2">{viewer.provider === "demo" ? "Demo session (no account)" : viewer.provider === "github" ? "GitHub" : "Google"}</span></Row>
            </Section>
            <Section title="Default lens" sub={saved ? "Saved" : "Where new projects open. You can always switch."}>
              <div className="grid gap-2 sm:grid-cols-2">
                {([["describe", "Describe", "Chat and live preview first", MessageSquareText], ["code", "Code", "Files, diffs and terminal first", Code2]] as const).map(([k, l, s, I]) => (
                  <button key={k} onClick={() => pickLens(k)} className={cn("flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors", lens === k ? (k === "code" ? "border-code/50 bg-code/[0.05]" : "border-accent/50 bg-accent-soft") : "border-line hover:border-line-strong")}>
                    <I className={cn("mt-0.5 h-4 w-4", k === "code" ? "text-code" : "text-accent")} />
                    <span className="flex-1"><span className="block text-[13.5px] font-medium">{l}</span><span className="block text-[12px] text-text-3">{s}</span></span>
                    {lens === k && <Check className="h-4 w-4 text-text" />}
                  </button>
                ))}
              </div>
            </Section>
            <form action={logout}><button className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-[13px] text-text-2 hover:bg-surface-2 hover:text-text"><LogOut className="h-3.5 w-3.5" /> Sign out</button></form>
          </>}
          {tab === "workspace" && <Section title="Workspace">
            <Row label="Name"><input defaultValue={viewer.name === "Guest" ? "Demo workspace" : `${viewer.name.split(" ")[0]}'s workspace`} className="h-9 w-full rounded-lg border border-line bg-bg px-3 text-[13px] outline-none focus:border-line-strong" /></Row>
            <Row label="Default model"><select className="h-9 w-full rounded-lg border border-line bg-bg px-2.5 text-[13px] outline-none"><option>gpt-4.1</option><option>claude-sonnet-4.5</option><option>gemini-2.5-pro</option></select></Row>
            <Row label="Data region"><select className="h-9 w-full rounded-lg border border-line bg-bg px-2.5 text-[13px] outline-none"><option>US (Virginia)</option><option>EU (Frankfurt)</option><option>India (Mumbai)</option></select></Row>
          </Section>}
          {tab === "members" && <Section title="Members" sub="Business users get Describe by default, developers get Code. Same projects.">
            {[["You", viewer.email ?? "owner", "Owner", "describe"], ["Rahul K.", "rahul@acme.co", "Developer", "code"], ["Meera S.", "meera@acme.co", "Builder", "describe"]].map(([n, e, r, l]) => (
              <div key={n} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold", l === "code" ? "bg-code text-bg" : "bg-accent text-accent-ink")}>{n.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
                <div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{n}</div><div className="truncate text-[12px] text-text-3">{e}</div></div>
                <span className="rounded-md bg-surface-2 px-2 py-1 text-[11.5px] text-text-2">{r}</span>
              </div>
            ))}
            <button className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2"><Plus className="h-3.5 w-3.5" /> Invite</button>
          </Section>}
          {tab === "keys" && <Section title="API keys" sub="Call your deployed agents from anywhere.">
            {[["Production", "arch_live_••••••••3f9a"], ["Development", "arch_test_••••••••b21c"]].map(([n, k]) => (
              <div key={n} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <KeyRound className="h-4 w-4 text-text-3" />
                <div className="min-w-0 flex-1"><div className="text-[13.5px] font-medium">{n}</div><div className="font-mono text-[12px] text-text-3">{k}</div></div>
                <button onClick={() => { setCopied(n); setTimeout(() => setCopied(null), 1200); }} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[12.5px] text-text-3 hover:bg-surface-2 hover:text-text">{copied === n ? <><Check className="h-3.5 w-3.5 text-ok" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}</button>
              </div>
            ))}
          </Section>}
          {tab === "billing" && <Section title="Plan">
            <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent-soft p-4">
              <div><div className="text-[15px] font-semibold">Pro</div><div className="text-[12.5px] text-text-2">10,000 build credits / month · unlimited deploys</div></div>
              <span className="text-[15px] font-semibold">$49<span className="text-[12px] font-normal text-text-3">/mo</span></span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[12.5px]"><span className="text-text-2">Credits used</span><span className="font-mono">6,240 / 10,000</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full w-[62%] rounded-full bg-accent" /></div>
              <div className="mt-1.5 text-[11.5px] text-text-3">Resets Oct 1</div>
            </div>
          </Section>}
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-line bg-elev p-4 sm:p-5"><div className="mb-4"><h2 className="text-[14px] font-semibold">{title}</h2>{sub && <p className="mt-0.5 text-[12.5px] text-text-3">{sub}</p>}</div>{children}</section>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid items-center gap-1.5 border-b border-line py-3 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr]"><span className="text-[12.5px] text-text-3">{label}</span>{children}</div>;
}

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "live" | "building" | "draft";
  updated: string;
  agents: number;
  origin: "prompt" | "github" | "template";
  repo?: string;
  hue: number;
};

export const projects: Project[] = [
  { id: "lead-scout", name: "Lead Scout", description: "Finds and scores B2B leads from LinkedIn + Apollo, drafts first-touch emails.", status: "live", updated: "2h ago", agents: 3, origin: "prompt", hue: 78 },
  { id: "support-copilot", name: "Support Copilot", description: "Triage Zendesk tickets, suggest replies grounded in the help center.", status: "building", updated: "12m ago", agents: 2, origin: "github", repo: "acme/support-copilot", hue: 200 },
  { id: "invoice-desk", name: "Invoice Desk", description: "Reads invoices from Gmail, extracts line items, syncs to QuickBooks.", status: "draft", updated: "Yesterday", agents: 2, origin: "template", hue: 28 },
  { id: "market-pulse", name: "Market Pulse", description: "Daily prediction-market brief: odds moves, volume spikes, news drivers.", status: "live", updated: "3d ago", agents: 4, origin: "prompt", hue: 280 },
];

export type Template = { id: string; name: string; blurb: string; tags: string[]; agents: number; uses: string };

export const templates: Template[] = [
  { id: "research-analyst", name: "Research analyst", blurb: "Deep web research with citations, exported as a brief.", tags: ["Research", "Docs"], agents: 3, uses: "12.4k" },
  { id: "sales-sdr", name: "AI SDR", blurb: "Prospect, enrich and write personalised outreach.", tags: ["Sales", "Gmail"], agents: 3, uses: "9.1k" },
  { id: "support-desk", name: "Support desk", blurb: "Ticket triage + grounded answers from your docs.", tags: ["Support", "RAG"], agents: 2, uses: "7.8k" },
  { id: "hr-screener", name: "Resume screener", blurb: "Score candidates against a JD and schedule interviews.", tags: ["HR", "Calendar"], agents: 2, uses: "5.2k" },
  { id: "data-chat", name: "Chat with your data", blurb: "Ask questions over Postgres or CSV, get charts back.", tags: ["Analytics", "SQL"], agents: 2, uses: "11.0k" },
  { id: "content-studio", name: "Content studio", blurb: "Plan, draft and schedule posts across channels.", tags: ["Marketing"], agents: 4, uses: "6.3k" },
];

export const suggestions = [
  "A CRM for my agency that drafts follow-ups after every call",
  "Turn our support tickets into a weekly insights dashboard",
  "An internal tool to answer HR policy questions from our handbook",
  "A prediction-market tracker that alerts me on big odds moves",
];

export const repos = [
  { name: "acme/support-copilot", lang: "TypeScript", stack: "Next.js · Prisma", updated: "today", private: true },
  { name: "acme/pricing-engine", lang: "Python", stack: "FastAPI · LangGraph", updated: "2d ago", private: true },
  { name: "acme/marketing-site", lang: "TypeScript", stack: "Astro", updated: "1w ago", private: false },
  { name: "acme/agents-lab", lang: "Python", stack: "CrewAI", updated: "3w ago", private: false },
];

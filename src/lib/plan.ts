export type PlanAgent = { id: string; name: string; role: string; tools: string[]; model: string };
export type PlanTable = { name: string; fields: string[] };
export type PlanQuestion = { id: string; q: string; options: string[]; answer?: string };
export type Plan = {
  name: string;
  slug: string;
  summary: string;
  audience: string;
  pages: string[];
  agents: PlanAgent[];
  data: PlanTable[];
  integrations: string[];
  questions: PlanQuestion[];
  prompt: string;
};

const ALL_INTEGRATIONS = ["Gmail", "Slack", "Notion", "HubSpot", "Salesforce", "Google Sheets", "Postgres", "Stripe", "Zendesk", "QuickBooks", "GitHub", "Google Calendar", "Apollo", "LinkedIn", "Polymarket", "Kalshi"];
export const integrationCatalog = ALL_INTEGRATIONS;

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "untitled";
}

type Archetype = { match: RegExp; name: string; audience: string; pages: string[]; agents: PlanAgent[]; data: PlanTable[]; integrations: string[]; questions: PlanQuestion[] };

const A = (id: string, name: string, role: string, tools: string[], model = "gpt-4.1"): PlanAgent => ({ id, name, role, tools, model });

const archetypes: Archetype[] = [
  {
    match: /crm|lead|sales|prospect|follow-?up|sdr|outreach/i,
    name: "Deal Desk",
    audience: "Sales team and account managers",
    pages: ["Pipeline board", "Contact detail", "Follow-up queue", "Insights"],
    agents: [A("scribe", "Call Scribe", "Summarises each call into notes and next steps", ["Calendar", "Transcripts"]), A("followup", "Follow-up Writer", "Drafts a follow-up email in your tone after every call", ["Gmail"]), A("scorer", "Deal Scorer", "Scores deal health from activity and sentiment", ["CRM"], "gpt-4.1-mini")],
    data: [{ name: "contacts", fields: ["name", "company", "email", "stage"] }, { name: "calls", fields: ["contact_id", "summary", "next_steps", "at"] }, { name: "drafts", fields: ["contact_id", "subject", "body", "status"] }],
    integrations: ["Gmail", "Google Calendar", "HubSpot"],
    questions: [{ id: "send", q: "Should follow-ups send automatically or wait for approval?", options: ["Wait for my approval", "Auto-send after 1 hour", "Auto-send"] }, { id: "crm", q: "Where do contacts live today?", options: ["HubSpot", "Salesforce", "A spreadsheet", "Nowhere yet"] }],
  },
  {
    match: /support|ticket|helpdesk|zendesk|customer service/i,
    name: "Ticket Lens",
    audience: "Support leads and product managers",
    pages: ["Insights dashboard", "Themes", "Ticket explorer", "Weekly report"],
    agents: [A("triage", "Triage Agent", "Tags and routes every new ticket", ["Zendesk"], "gpt-4.1-mini"), A("themes", "Theme Miner", "Clusters tickets into recurring themes", ["Vector store"]), A("reporter", "Report Writer", "Writes the weekly insights summary", ["Slack", "Notion"])],
    data: [{ name: "tickets", fields: ["subject", "body", "tags", "sentiment"] }, { name: "themes", fields: ["label", "count", "trend"] }, { name: "reports", fields: ["week", "summary", "sent_at"] }],
    integrations: ["Zendesk", "Slack", "Notion"],
    questions: [{ id: "cadence", q: "When should the weekly report go out?", options: ["Monday 9am", "Friday 5pm", "Only on demand"] }, { id: "where", q: "Where should it be posted?", options: ["Slack channel", "Email", "Notion page"] }],
  },
  {
    match: /hr|policy|handbook|employee|onboarding|internal tool/i,
    name: "Policy Pal",
    audience: "Employees and the HR team",
    pages: ["Ask", "Sources", "Unanswered questions", "Admin"],
    agents: [A("answer", "Policy Answerer", "Answers questions with citations from the handbook", ["Knowledge base"]), A("gap", "Gap Finder", "Flags questions the handbook doesn't cover", ["Slack"], "gpt-4.1-mini")],
    data: [{ name: "documents", fields: ["title", "url", "updated_at"] }, { name: "questions", fields: ["asker", "text", "answer", "confidence"] }],
    integrations: ["Notion", "Slack", "Google Sheets"],
    questions: [{ id: "access", q: "Who can use it?", options: ["Everyone at the company", "Only HR", "Specific teams"] }, { id: "low", q: "When the agent isn't sure, it should…", options: ["Say so and tag HR", "Give its best guess", "Stay silent"] }],
  },
  {
    match: /market|odds|prediction|polymarket|kalshi|trading|crypto|price/i,
    name: "Odds Radar",
    audience: "Traders and research analysts",
    pages: ["Watchlist", "Market detail", "Alerts", "Daily brief"],
    agents: [A("watch", "Market Watcher", "Polls markets and detects big odds moves", ["Polymarket", "Kalshi"], "gpt-4.1-mini"), A("why", "Why-it-moved Analyst", "Finds the news behind each move", ["Web search"]), A("brief", "Brief Writer", "Writes the morning brief", ["Slack", "Gmail"])],
    data: [{ name: "markets", fields: ["source", "title", "odds", "volume"] }, { name: "moves", fields: ["market_id", "delta", "at", "reason"] }, { name: "alerts", fields: ["rule", "channel", "active"] }],
    integrations: ["Polymarket", "Kalshi", "Slack"],
    questions: [{ id: "threshold", q: "What counts as a big move?", options: ["5 points in 1 hour", "10 points in a day", "Let me set per market"] }, { id: "channel", q: "Where should alerts go?", options: ["Slack", "Email", "Push notification"] }],
  },
];

const fallback: Archetype = {
  match: /.*/,
  name: "",
  audience: "Your team",
  pages: ["Dashboard", "Detail view", "Activity", "Settings"],
  agents: [A("planner", "Planner", "Breaks requests into steps", ["Memory"]), A("worker", "Worker", "Executes each step with tools", ["Web search", "HTTP"]), A("reviewer", "Reviewer", "Checks output quality before it's shown", [], "gpt-4.1-mini")],
  data: [{ name: "items", fields: ["title", "status", "owner"] }, { name: "runs", fields: ["agent", "input", "output", "at"] }],
  integrations: ["Slack", "Google Sheets"],
  questions: [{ id: "who", q: "Who will use this day to day?", options: ["Just me", "My team", "Our customers"] }, { id: "auth", q: "Do users need to sign in?", options: ["Yes, Google sign-in", "Yes, email", "No, public"] }],
};

export function makePlan(prompt: string): Plan {
  const p = prompt.trim() || "An agentic app";
  const arch = archetypes.find((a) => a.match.test(p)) ?? fallback;
  let name = arch.name;
  if (!name) {
    const words = p.replace(/^(a|an|the|build|make|create)\s+/i, "").split(/\s+/).slice(0, 3).join(" ");
    name = titleCase(words.replace(/[^\w\s]/g, ""));
  }
  return {
    name,
    slug: slugify(name),
    summary: p.length > 160 ? p.slice(0, 157) + "…" : p,
    audience: arch.audience,
    pages: [...arch.pages],
    agents: arch.agents.map((a) => ({ ...a, tools: [...a.tools] })),
    data: arch.data.map((d) => ({ ...d, fields: [...d.fields] })),
    integrations: [...arch.integrations],
    questions: arch.questions.map((q) => ({ ...q })),
    prompt: p,
  };
}

export const PLAN_KEY = (slug: string) => `architect.plan.${slug}`;

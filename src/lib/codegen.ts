import type { Plan } from "@/lib/plan";
import { slugify } from "@/lib/plan";

export type FileNode = { path: string; lang: "ts" | "tsx" | "md" | "sql" | "json"; content: string };

const camel = (s: string) => slugify(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function generateFiles(plan: Plan): FileNode[] {
  const files: FileNode[] = [];
  files.push({
    path: "plan.md",
    lang: "md",
    content: `# ${plan.name}\n\n${plan.summary}\n\n**For:** ${plan.audience}\n\n## Pages\n${plan.pages.map((p) => `- ${p}  (/${slugify(p)})`).join("\n")}\n\n## Agents\n${plan.agents.map((a) => `- **${a.name}**: ${a.role}`).join("\n")}\n\n## Data\n${plan.data.map((d) => `- ${d.name}(${d.fields.join(", ")})`).join("\n")}\n\n## Integrations\n${plan.integrations.join(", ")}\n`,
  });
  plan.pages.forEach((p) => {
    const comp = camel(p).replace(/^./, (c) => c.toUpperCase()) || "Page";
    files.push({
      path: `app/${slugify(p)}/page.tsx`,
      lang: "tsx",
      content: `import { Card, DataTable, AgentFeed } from "@/components";\nimport { db } from "@/db";\n\nexport default async function ${comp}() {\n  const rows = await db.${plan.data[0]?.name ?? "items"}.findMany({ take: 50 });\n\n  return (\n    <main className="space-y-6 p-8">\n      <h1 className="text-2xl font-semibold">${p}</h1>\n      <div className="grid grid-cols-3 gap-4">\n        <Card label="Total" value={rows.length} />\n        <Card label="This week" trend="+12%" />\n        <Card label="Needs review" tone="warn" />\n      </div>\n      <DataTable rows={rows} />\n      <AgentFeed agents={[${plan.agents.map((a) => `"${a.id}"`).join(", ")}]} />\n    </main>\n  );\n}\n`,
    });
  });
  plan.agents.forEach((a, i) => {
    const next = plan.agents[i + 1];
    files.push({
      path: `agents/${slugify(a.name)}.ts`,
      lang: "ts",
      content: `import { agent, tool } from "@lyzr/agents";\nimport { z } from "zod";\n${next ? `import { ${camel(next.name)} } from "./${slugify(next.name)}";\n` : ""}\nexport const ${camel(a.name)} = agent({\n  name: "${a.name}",\n  model: "${a.model}",\n  instructions: \`${a.role}.\`,\n  tools: [${a.tools.map((t) => `tool("${slugify(t)}")`).join(", ")}],\n  output: z.object({\n    result: z.string(),\n    confidence: z.number().min(0).max(1),\n  }),\n${next ? `  handoff: ${camel(next.name)},\n` : ""}});\n`,
    });
  });
  files.push({
    path: "db/schema.sql",
    lang: "sql",
    content: plan.data.map((d) => `create table ${d.name} (\n  id uuid primary key default gen_random_uuid(),\n${d.fields.map((f) => `  ${f} text`).join(",\n")},\n  created_at timestamptz default now()\n);`).join("\n\n") + "\n",
  });
  files.push({
    path: "architect.json",
    lang: "json",
    content: JSON.stringify({ name: plan.slug, framework: "nextjs", agents: "lyzr", integrations: plan.integrations, deploy: { preview: "every-branch", production: "main" } }, null, 2) + "\n",
  });
  return files;
}

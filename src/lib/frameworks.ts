import type { PlanAgent } from "@/lib/plan";
import { slugify } from "@/lib/plan";

export type FrameworkId = "lyzr" | "langgraph" | "crewai" | "openai" | "adk";
export type Framework = { id: FrameworkId; name: string; lang: "TypeScript" | "Python"; blurb: string; file: string };

export const FRAMEWORKS: Framework[] = [
  { id: "lyzr", name: "Lyzr ADK", lang: "TypeScript", blurb: "Managed runtime, built-in guardrails and memory", file: "agents/flow.ts" },
  { id: "langgraph", name: "LangGraph", lang: "Python", blurb: "Graph of nodes with explicit state", file: "agents/graph.py" },
  { id: "crewai", name: "CrewAI", lang: "Python", blurb: "Role-based crew with sequential tasks", file: "agents/crew.py" },
  { id: "openai", name: "OpenAI Agents SDK", lang: "TypeScript", blurb: "Lightweight agents with handoffs", file: "agents/agents.ts" },
  { id: "adk", name: "Google ADK", lang: "Python", blurb: "Sequential agent pipeline on Vertex", file: "agents/pipeline.py" },
];

export type AgentConfig = PlanAgent & { instructions: string; memory: boolean; approval: boolean; pii: boolean; maxCost: number; temperature: number };

const camel = (s: string) => s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase());
const snake = (s: string) => slugify(s).replace(/-/g, "_");

export function generateAgentCode(fw: FrameworkId, agents: AgentConfig[]): string {
  if (fw === "lyzr") {
    return `import { agent, flow, tool, guardrails } from "@lyzr/agents";
import { z } from "zod";

${agents.map((a) => `export const ${camel(a.name)} = agent({
  name: "${a.name}",
  model: "${a.model}",
  temperature: ${a.temperature},
  instructions: \`${a.instructions}\`,
  tools: [${a.tools.map((t) => `tool("${slugify(t)}")`).join(", ")}],
  memory: ${a.memory ? `{ scope: "project", ttlDays: 30 }` : "false"},
  guardrails: guardrails({ pii: ${a.pii}, maxCostUsd: ${a.maxCost.toFixed(2)}${a.approval ? ", humanApproval: true" : ""} }),
  output: z.object({ result: z.string(), confidence: z.number() }),
});`).join("\n\n")}

// Runs left to right. Each agent gets the previous agent's output.
export default flow([${agents.map((a) => camel(a.name)).join(", ")}]);
`;
  }
  if (fw === "langgraph") {
    return `from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from tools import ${[...new Set(agents.flatMap((a) => a.tools))].map(snake).join(", ") || "noop"}

class State(TypedDict):
    input: str
    result: str

${agents.map((a) => `def ${snake(a.name)}(state: State) -> State:
    # ${a.instructions}
    llm = ChatOpenAI(model="${a.model}", temperature=${a.temperature})
    llm = llm.bind_tools([${a.tools.map(snake).join(", ")}])
    reply = llm.invoke(state["result"] or state["input"])
    return {**state, "result": reply.content}`).join("\n\n")}

graph = StateGraph(State)
${agents.map((a) => `graph.add_node("${snake(a.name)}", ${snake(a.name)})`).join("\n")}
graph.set_entry_point("${snake(agents[0]?.name ?? "start")}")
${agents.map((a, i) => `graph.add_edge("${snake(a.name)}", ${agents[i + 1] ? `"${snake(agents[i + 1].name)}"` : "END"})`).join("\n")}
app = graph.compile()
`;
  }
  if (fw === "crewai") {
    return `from crewai import Agent, Task, Crew, Process
from tools import ${[...new Set(agents.flatMap((a) => a.tools))].map(snake).join(", ") || "noop"}

${agents.map((a) => `${snake(a.name)} = Agent(
    role="${a.name}",
    goal="${a.instructions}",
    backstory="Part of the team. Hands clean, structured output to the next step.",
    tools=[${a.tools.map(snake).join(", ")}],
    llm="${a.model}",
    memory=${a.memory ? "True" : "False"},
)`).join("\n\n")}

tasks = [
${agents.map((a) => `    Task(description="${a.role}", agent=${snake(a.name)}, expected_output="JSON with result and confidence"${a.approval ? ", human_input=True" : ""}),`).join("\n")}
]

crew = Crew(agents=[${agents.map((a) => snake(a.name)).join(", ")}], tasks=tasks, process=Process.sequential)
`;
  }
  if (fw === "openai") {
    return `import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

${[...agents].reverse().map((a, i, arr) => `export const ${camel(a.name)} = new Agent({
  name: "${a.name}",
  model: "${a.model}",
  instructions: \`${a.instructions}\`,
  tools: [${a.tools.map((t) => camel(t) + "Tool").join(", ")}],${i > 0 ? `\n  handoffs: [${camel(arr[i - 1].name)}],` : ""}
  outputType: z.object({ result: z.string(), confidence: z.number() }),
});`).join("\n\n")}

export async function runFlow(input: string) {
  return run(${camel(agents[0]?.name ?? "agent")}, input);
}
`;
  }
  return `from google.adk.agents import LlmAgent, SequentialAgent
from tools import ${[...new Set(agents.flatMap((a) => a.tools))].map(snake).join(", ") || "noop"}

${agents.map((a) => `${snake(a.name)} = LlmAgent(
    name="${snake(a.name)}",
    model="${a.model.startsWith("gpt") ? "gemini-2.5-flash" : a.model}",
    instruction="${a.instructions}",
    tools=[${a.tools.map(snake).join(", ")}],
    output_key="${snake(a.name)}_result",
)`).join("\n\n")}

root_agent = SequentialAgent(
    name="pipeline",
    sub_agents=[${agents.map((a) => snake(a.name)).join(", ")}],
)
`;
}

export const MODELS = ["gpt-4.1", "gpt-4.1-mini", "claude-sonnet-4.5", "gemini-2.5-pro", "gemini-2.5-flash", "llama-3.3-70b"];

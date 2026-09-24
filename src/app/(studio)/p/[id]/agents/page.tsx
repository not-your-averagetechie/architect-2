import { AgentBuilder } from "@/components/agents/agent-builder";

export default async function AgentsPage(props: PageProps<"/p/[id]/agents">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  return <AgentBuilder id={id} initialAgent={typeof sp.agent === "string" ? sp.agent : undefined} />;
}

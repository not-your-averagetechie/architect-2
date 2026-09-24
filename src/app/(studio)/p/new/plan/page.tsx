import { PlanReview } from "@/components/plan/plan-review";

export default async function PlanPage(props: PageProps<"/p/new/plan">) {
  const sp = await props.searchParams;
  const prompt = typeof sp.prompt === "string" ? sp.prompt : "";
  const lens = sp.lens === "code" ? "code" : "describe";
  return <PlanReview prompt={prompt} lens={lens} />;
}

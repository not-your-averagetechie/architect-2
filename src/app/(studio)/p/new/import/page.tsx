import { ImportView } from "@/components/import/import-view";

export default async function ImportPage(props: PageProps<"/p/new/import">) {
  const sp = await props.searchParams;
  const repo = typeof sp.repo === "string" && sp.repo ? sp.repo : "acme/support-copilot";
  return <ImportView repo={repo} />;
}

import { getViewer } from "@/lib/session";
import { Workspace } from "@/components/workspace/workspace";

export default async function ProjectPage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const viewer = (await getViewer())!;
  const lens = sp.lens === "code" || sp.lens === "describe" ? sp.lens : viewer.lens;
  return <Workspace id={id} initialLens={lens} build={sp.build === "1"} viewerName={viewer.name} />;
}

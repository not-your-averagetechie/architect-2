import { DeployView } from "@/components/deploy/deploy-view";

export default async function DeployPage(props: PageProps<"/p/[id]/deploy">) {
  const { id } = await props.params;
  return <DeployView id={id} />;
}

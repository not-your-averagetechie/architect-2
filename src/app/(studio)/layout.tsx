import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";

export default async function StudioLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return <>{children}</>;
}

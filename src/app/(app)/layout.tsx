import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { Sidebar } from "@/components/shell/sidebar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (!viewer.onboarded) redirect("/onboarding");
  return (
    <div className="flex min-h-screen">
      <Sidebar viewer={viewer} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

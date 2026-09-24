import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { Sidebar } from "@/components/shell/sidebar";
import { MobileTopBar, MobileTabBar } from "@/components/shell/mobile-nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (!viewer.onboarded) redirect("/onboarding");
  return (
    <div className="flex min-h-screen">
      <Sidebar viewer={viewer} />
      <div className="min-w-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <MobileTopBar name={viewer.name} />
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
}

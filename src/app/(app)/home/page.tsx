import { cookies } from "next/headers";
import { getViewer } from "@/lib/session";
import { HomeView } from "@/components/home/home-view";

export default async function HomePage() {
  const viewer = (await getViewer())!;
  const goal = (await cookies()).get("arch_goal")?.value;
  return <HomeView name={viewer.name} lens={viewer.lens} goal={goal} />;
}

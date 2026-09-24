import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { OnboardingForm } from "./form";

export default async function Onboarding() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return <OnboardingForm name={viewer.name.split(" ")[0]} />;
}

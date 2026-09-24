import { getViewer } from "@/lib/session";
import { SettingsView } from "@/components/pages/settings-view";

export default async function Page() {
  const viewer = (await getViewer())!;
  return <SettingsView viewer={viewer} />;
}

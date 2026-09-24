import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export type Viewer = {
  name: string;
  email?: string | null;
  image?: string | null;
  provider: "github" | "google" | "demo";
  lens: "describe" | "code";
  onboarded: boolean;
};

export async function getViewer(): Promise<Viewer | null> {
  const jar = await cookies();
  const lens = jar.get("arch_lens")?.value === "code" ? "code" : "describe";
  const onboarded = jar.has("arch_lens");
  const session = await auth().catch(() => null);
  if (session?.user) {
    const provider = (session as { provider?: string }).provider === "google" ? "google" : "github";
    return { name: session.user.name ?? "Builder", email: session.user.email, image: session.user.image, provider, lens, onboarded };
  }
  const demo = jar.get("arch_demo")?.value;
  if (demo) return { name: decodeURIComponent(demo), provider: "demo", lens, onboarded };
  return null;
}

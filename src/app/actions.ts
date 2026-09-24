"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

const YEAR = 60 * 60 * 24 * 365;

export async function signInWith(provider: "github" | "google") {
  await signIn(provider, { redirectTo: "/onboarding" });
}

export async function startDemo() {
  const jar = await cookies();
  jar.set("arch_demo", "Guest", { maxAge: YEAR, path: "/", sameSite: "lax" });
  redirect(jar.has("arch_lens") ? "/home" : "/onboarding");
}

export async function completeOnboarding(formData: FormData) {
  const lens = formData.get("lens") === "code" ? "code" : "describe";
  const jar = await cookies();
  jar.set("arch_lens", lens, { maxAge: YEAR, path: "/", sameSite: "lax" });
  const goal = String(formData.get("goal") ?? "");
  if (goal) jar.set("arch_goal", goal, { maxAge: YEAR, path: "/", sameSite: "lax" });
  redirect("/home");
}

export async function setLens(lens: "describe" | "code") {
  const jar = await cookies();
  jar.set("arch_lens", lens, { maxAge: YEAR, path: "/", sameSite: "lax" });
}

export async function logout() {
  const jar = await cookies();
  jar.delete("arch_demo");
  await signOut({ redirectTo: "/" }).catch(() => undefined);
  redirect("/");
}

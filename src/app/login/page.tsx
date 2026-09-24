import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { providerFlags } from "@/lib/auth";
import { getViewer } from "@/lib/session";
import { signInWith, startDemo } from "@/app/actions";
import { AuthStory } from "@/components/landing/auth-story";

function GitHubIcon() {
  return <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>;
}
function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/></svg>;
}

export default async function LoginPage() {
  const viewer = await getViewer();
  if (viewer) redirect(viewer.onboarded ? "/home" : "/onboarding");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-elev lg:block">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 glow" />
        <div className="relative flex h-full flex-col p-10">
          <Link href="/"><Logo /></Link>
          <div className="my-auto"><AuthStory /></div>
          <p className="text-xs text-text-3">Every change, from a prompt or a keystroke, is a commit.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">Sign in to Architect</h1>
          <p className="mt-2 text-sm text-text-2">Developers: sign in with GitHub to import repos and push commits.</p>

          <div className="mt-8 space-y-3">
            <form action={signInWith.bind(null, "github")}>
              <button disabled={!providerFlags.github} className="focus-ring flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-text text-bg text-sm font-medium hover:bg-white disabled:opacity-40">
                <GitHubIcon /> Continue with GitHub
              </button>
            </form>
            <form action={signInWith.bind(null, "google")}>
              <button disabled={!providerFlags.google} className="focus-ring flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line-strong text-sm font-medium hover:bg-surface-2 disabled:opacity-40">
                <GoogleIcon /> Continue with Google
              </button>
            </form>

            <div className="flex items-center gap-3 py-2 text-[11px] uppercase tracking-wider text-text-3">
              <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input type="email" placeholder="work@company.com" className="focus-ring h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-text-3" />
              </div>
              <button type="button" title="Magic links are part of the design; not wired in this prototype" className="h-11 rounded-xl border border-line px-3 text-sm text-text-2 hover:bg-surface-2">Email link</button>
            </div>
          </div>

          <form action={startDemo} className="mt-8">
            <button className="focus-ring group flex w-full items-center justify-between rounded-xl border border-accent/25 bg-accent-soft px-4 py-3 text-left">
              <span>
                <span className="block text-sm font-medium text-accent">Explore without an account</span>
                <span className="block text-xs text-text-2">Full demo workspace with sample projects</span>
              </span>
              <ArrowRight className="h-4 w-4 text-accent transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-8 text-xs leading-relaxed text-text-3">
            By continuing you agree to the Terms and Privacy Policy. SSO (SAML/OIDC) is available on Enterprise.
          </p>
        </div>
      </main>
    </div>
  );
}

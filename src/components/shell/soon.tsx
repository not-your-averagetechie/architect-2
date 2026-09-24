import Link from "next/link";
import { Hammer } from "lucide-react";

export function Soon({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-elev"><Hammer className="h-5 w-5 text-accent" /></span>
        <h1 className="mt-5 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-text-2">{body}</p>
        <Link href="/home" className="mt-6 inline-flex h-9 items-center rounded-lg border border-line px-3 text-[13px] hover:bg-surface-2">Back to Home</Link>
      </div>
    </div>
  );
}

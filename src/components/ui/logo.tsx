import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#d4ff3f" />
      <path d="M9 23 L16 8 L23 23" stroke="#141a00" strokeWidth="2.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12.2 17.5 H19.8" stroke="#141a00" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        Architect <span className="text-text-3 font-normal">2.0</span>
      </span>
    </span>
  );
}

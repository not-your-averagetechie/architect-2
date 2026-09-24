import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110 font-medium shadow-[0_0_0_1px_rgba(212,255,63,0.4),0_8px_24px_-8px_rgba(212,255,63,0.45)]",
  secondary: "bg-surface-2 text-text hover:bg-[#24242a] border border-line",
  ghost: "text-text-2 hover:text-text hover:bg-surface-2",
  outline: "border border-line-strong text-text hover:bg-surface-2",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "focus-ring inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface px-1 font-mono text-[10px] text-text-3", className)}>
      {children}
    </kbd>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "accent" | "code" | "ok" | "warn"; className?: string }) {
  const tones = {
    neutral: "bg-surface-2 text-text-2 border-line",
    accent: "bg-accent-soft text-accent border-accent/25",
    code: "bg-code/10 text-code border-code/25",
    ok: "bg-ok/10 text-ok border-ok/25",
    warn: "bg-warn/10 text-warn border-warn/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

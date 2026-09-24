export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line px-4 pb-5 pt-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pt-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-text-2">{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-text-3">{icon}</span>
      <p className="mt-3 text-[14px] font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-text-3">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

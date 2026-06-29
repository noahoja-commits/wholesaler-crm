import { AlertCircle } from "lucide-react";

export function LoadingSkeleton({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-sm text-[var(--color-text-tertiary)]">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-12 text-center">
      <div className="h-12 w-12 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-[var(--color-text-tertiary)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">{title}</h3>
      {description && <p className="text-xs text-[var(--color-text-tertiary)] mt-2 mb-5">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

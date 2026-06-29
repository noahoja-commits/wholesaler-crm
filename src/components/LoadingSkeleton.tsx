import { AlertCircle } from "lucide-react";

export function LoadingSkeleton({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-zinc-500">{label}</div>
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
      <Icon className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
      <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
      {description && <p className="text-xs text-zinc-600 mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
}

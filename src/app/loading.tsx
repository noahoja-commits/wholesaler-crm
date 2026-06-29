import { StatCardSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="h-5 w-32 bg-[var(--color-surface-hover)] rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-[var(--color-surface-hover)] rounded animate-pulse" />
            <div className="h-12 bg-[var(--color-surface-hover)] rounded animate-pulse" />
            <div className="h-12 bg-[var(--color-surface-hover)] rounded animate-pulse" />
          </div>
        </div>
        <div className="card p-5">
          <div className="h-5 w-32 bg-[var(--color-surface-hover)] rounded animate-pulse mb-4" />
          <div className="h-48 bg-[var(--color-surface-hover)] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

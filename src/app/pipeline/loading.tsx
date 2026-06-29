import { PipelineSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-[var(--color-surface-hover)] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[var(--color-surface-hover)] rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-28 bg-[var(--color-surface-hover)] rounded animate-pulse" />
      </div>
      <PipelineSkeleton />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2 text-zinc-500">
        <div className="h-4 w-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}

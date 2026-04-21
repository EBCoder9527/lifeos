/** Skeleton placeholder block with pulse animation */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-[#7c6fea] animate-[skeleton-pulse_1.5s_ease-in-out_infinite] ${className}`}
    />
  )
}

/** Skeleton layout matching TodayPage card structure */
export function TodayPageSkeleton() {
  return (
    <div className="p-5">
      {/* Greeting */}
      <div className="mb-6">
        <Skeleton className="h-3.5 w-28 mb-2" />
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-3.5 w-36" />
      </div>

      {/* Mood card */}
      <div className="card p-5 mb-4">
        <Skeleton className="h-3 w-16 mb-3" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1.5" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Habit card */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-5">
          <Skeleton className="w-[72px] h-[72px] rounded-full" />
          <div className="flex-1 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-18 rounded-full" />
          </div>
        </div>
      </div>

      {/* Plan card */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full mt-4" />
      </div>

      {/* Idea card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3.5 w-full mb-1.5" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}

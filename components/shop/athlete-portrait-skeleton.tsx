import { Skeleton } from '@/components/ui/skeleton';

export function AthletePortraitSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100 animate-pulse">
        {/* Placeholder for the bottom-overlaid name + sport */}
        <div className="absolute bottom-6 left-6 right-12 space-y-2">
          <Skeleton className="h-2.5 w-20 rounded bg-stone-300" />
          <Skeleton className="h-7 w-2/3 rounded bg-stone-300" />
        </div>
      </div>
    </div>
  );
}

export function AthletesGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <AthletePortraitSkeleton key={i} />
      ))}
    </div>
  );
}

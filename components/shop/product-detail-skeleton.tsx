import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Image plate */}
        <div className="aspect-square rounded-full bg-stone-100 animate-pulse ring-1 ring-stone-100" />

        {/* Right column */}
        <div>
          {/* Eyebrow + Goal badge */}
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="mt-4 h-12 w-4/5 rounded" />
          <Skeleton className="mt-3 h-12 w-3/5 rounded" />

          {/* Description */}
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-11/12 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          {/* Price block */}
          <div className="mt-8 flex items-center gap-4">
            <Skeleton className="h-9 w-28 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="mt-2 h-3 w-40 rounded" />

          {/* Quantity + Add button */}
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-32 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>

          {/* Macros section header */}
          <div className="mt-12">
            <Skeleton className="h-3 w-24 rounded mb-4" />
            <div className="grid grid-cols-3 md:grid-cols-6 border border-stone-200 rounded-xl overflow-hidden">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="px-3 py-4 text-center border-r border-stone-200 last:border-r-0"
                >
                  <Skeleton className="h-2.5 w-12 rounded mx-auto" />
                  <Skeleton className="h-7 w-14 rounded mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-12">
            <Skeleton className="h-3 w-32 rounded mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>

          {/* Allergens */}
          <div className="mt-12">
            <Skeleton className="h-3 w-32 rounded mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-12 pt-12 border-t border-stone-200">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-32 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {[0, 1].map((i) => (
            <div key={i} className="border-t border-stone-200 pt-6">
              <Skeleton className="h-3 w-24 rounded mb-3" />
              <Skeleton className="h-5 w-3/5 rounded mb-2" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="mt-1 h-4 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

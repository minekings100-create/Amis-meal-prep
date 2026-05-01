import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <article className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6">
      {/* Plate-circle */}
      <div className="aspect-square w-full max-w-[300px] mx-auto rounded-full bg-stone-100 animate-pulse" />

      {/* Goal badge + attribute badges */}
      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Product name */}
      <Skeleton className="mt-4 h-6 w-3/4 rounded" />

      {/* Macros grid */}
      <div className="mt-4 grid grid-cols-4 border border-stone-200 rounded-xl overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="px-2 py-2.5 text-center border-r border-stone-200 last:border-r-0">
            <Skeleton className="h-2 w-10 rounded mx-auto" />
            <Skeleton className="h-4 w-8 rounded mx-auto mt-1.5" />
          </div>
        ))}
      </div>

      {/* Price + CTA row */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-20 rounded" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export function CartItemSkeleton({ size = 'drawer' }: { size?: 'drawer' | 'page' }) {
  const thumb = size === 'page' ? 'h-24 w-24' : 'h-20 w-20';
  return (
    <div className={`flex gap-${size === 'page' ? 6 : 4} ${size === 'page' ? 'py-6' : 'p-6'}`}>
      <div className={`${thumb} shrink-0 rounded-md bg-stone-100 animate-pulse`} />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CartItemsSkeleton({
  count = 2,
  size = 'drawer',
}: {
  count?: number;
  size?: 'drawer' | 'page';
}) {
  return (
    <ul className="divide-y divide-stone-200">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <CartItemSkeleton size={size} />
        </li>
      ))}
    </ul>
  );
}

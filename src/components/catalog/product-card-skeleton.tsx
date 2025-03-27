import { Skeleton } from '@/components/skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      {/* Imagen del producto */}
      <div className="relative pb-[100%]">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Contenido del producto */}
      <div className="p-4">
        <div className="mb-2">
          <Skeleton className="mb-1 h-3 w-16" />
          <Skeleton className="mb-1 h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>

        {/* Precio */}
        <Skeleton className="mb-3 h-6 w-20" />

        {/* Indicador de stock */}
        <Skeleton className="mb-3 h-4 w-16" />

        {/* Controles de cantidad y botón de añadir al carrito */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

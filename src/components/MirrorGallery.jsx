import React from 'react'
import MirrorProductCard from '@/components/MirrorProductCard'
import ProductSkeleton from '@/components/ProductSkeleton'

/**
 * Galería de productos (tarjetas). Imágenes: Cloudinary vía `optimizeCloudinaryUrl` en MirrorProductCard,
 * `loading="lazy"` y placeholder gris para evitar CLS.
 *
 * Rejilla responsive: 1 col (móvil), 2 (sm), 4 (lg+).
 * `gap` por defecto `gap-5` (catálogo); usa `gridGapClass` para otro espaciado (p. ej. destacados en Home).
 */
export const MIRROR_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

/**
 * Galería de espejos con estados de carga (esqueletos) y vacío.
 * @param {{
 *   loading: boolean
 *   items: Array<{ id: string } & Record<string, unknown>>
 *   variant?: 'default' | 'editorial'
 *   skeletonCount?: number
 *   emptyState?: React.ReactNode
 *   gridGapClass?: string
 *   className?: string
 * }} props
 */
const MirrorGallery = ({
  loading,
  items,
  variant = 'default',
  skeletonCount = 8,
  emptyState = null,
  gridGapClass = 'gap-5',
  className = '',
}) => {
  const gridClass = `${MIRROR_GRID_CLASS} ${gridGapClass} ${className}`.trim()

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductSkeleton key={i} variant={variant} />
        ))}
      </div>
    )
  }

  if (!items?.length) {
    return emptyState
  }

  return (
    <div className={gridClass}>
      {items.map((m) => (
        <MirrorProductCard key={m.id} mirror={m} variant={variant} />
      ))}
    </div>
  )
}

export default MirrorGallery

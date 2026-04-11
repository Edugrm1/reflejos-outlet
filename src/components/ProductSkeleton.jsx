import React from 'react'

/**
 * Placeholder de carga con la misma silueta que {@link MirrorProductCard}
 * (imagen + líneas de texto + franja tipo CTA). Usa `animate-pulse` de Tailwind.
 * @param {{ variant?: 'default' | 'editorial' }} props
 */
const ProductSkeleton = ({ variant = 'default' }) => {
  const isEditorial = variant === 'editorial'

  return (
    <article
      aria-hidden
      className={[
        'flex flex-col overflow-hidden animate-pulse',
        isEditorial
          ? 'rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 dark:bg-zinc-800 dark:ring-zinc-600'
          : 'rounded-3xl bg-gray-200 shadow-md dark:bg-zinc-700',
      ].join(' ')}
    >
      {/* Bloque imagen (misma altura que la tarjeta real; gris claro = sin CLS) */}
      <div
        className={[
          'bg-gray-200 dark:bg-zinc-600',
          isEditorial ? 'aspect-[4/5]' : 'aspect-square',
        ].join(' ')}
      />

      <div className={['flex flex-1 flex-col gap-3', isEditorial ? 'p-5' : 'px-4 pb-5 pt-4'].join(' ')}>
        {/* Título */}
        <div
          className={`h-4 rounded-md bg-stone-400/90 dark:bg-zinc-500 ${isEditorial ? 'w-[78%]' : 'w-4/5'}`}
        />
        {/* Precio */}
        <div className="h-4 w-1/2 rounded-md bg-stone-300 dark:bg-zinc-600" />
        {/* Medidas · sucursal */}
        <div className="h-3 w-2/3 rounded-md bg-stone-300/90 dark:bg-zinc-600" />
        {/* CTA WhatsApp */}
        <div
          className={[
            'mt-auto w-full rounded-full bg-stone-300 dark:bg-zinc-600',
            isEditorial ? 'h-11' : 'h-[52px]',
          ].join(' ')}
        />
      </div>
    </article>
  )
}

export default ProductSkeleton

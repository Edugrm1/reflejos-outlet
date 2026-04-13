import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { buildWhatsappUrl, formatCurrency, normalizeBranch, optimizeCloudinaryUrl } from '@/utils/mirrors'
import { useFavorites } from '@/hooks/useFavorites'
import { useUserRole } from '@/hooks/useUserRole'

const WhatsAppIcon = () => (
  <svg className="h-6 w-6 text-black dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/**
 * Tarjeta de producto: imagen Cloudinary, datos y CTA WhatsApp.
 * @param {{ variant?: 'default' | 'editorial' }} props
 */
const HeartOutline = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

const HeartFilled = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.002.001h-.002z" />
  </svg>
)

const MirrorProductCard = ({ mirror, variant = 'default' }) => {
  const { user } = useUserRole()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const nombre = mirror.nombre ?? mirror.name ?? 'Espejo'
  const sucursal = normalizeBranch(mirror.sucursal) || '—'
  const medidas = mirror.medidas ?? mirror.medida ?? mirror.size ?? '—'
  const precio = formatCurrency(mirror.precio ?? mirror.price)
  const imagenUrl = mirror.imagenUrl ?? mirror.imageUrl ?? ''
  const rawImageSrc = useMemo(() => (typeof imagenUrl === 'string' ? imagenUrl.trim() : ''), [imagenUrl])
  const optimizedImageSrc = useMemo(() => optimizeCloudinaryUrl(imagenUrl), [imagenUrl])
  const waUrl = buildWhatsappUrl(nombre)

  const isEditorial = variant === 'editorial'
  const detailTo = mirror.id ? `/producto/${mirror.id}` : null
  const productId = mirror.id
  const favorite = productId ? isFavorite(productId) : false

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!productId) return
    if (!user) {
      toast.info('Inicia sesión para guardar favoritos', {
        description: 'Podrás ver tus espejos en «Mis favoritos».',
      })
      return
    }
    if (favorite) {
      void removeFromFavorites(productId)
    } else {
      void addToFavorites(productId)
    }
  }

  /** Mientras llega la imagen desde Cloudinary */
  const [imageLoaded, setImageLoaded] = useState(!optimizedImageSrc)
  const [currentImageSrc, setCurrentImageSrc] = useState(optimizedImageSrc)

  useEffect(() => {
    setCurrentImageSrc(optimizedImageSrc)
    setImageLoaded(!optimizedImageSrc)
  }, [optimizedImageSrc])

  const handleImageError = () => {
    if (currentImageSrc !== rawImageSrc && rawImageSrc) {
      setCurrentImageSrc(rawImageSrc)
      setImageLoaded(false)
      return
    }
    setImageLoaded(true)
  }

  return (
    <article
      className={[
        'group flex flex-col overflow-hidden transition-all duration-300',
        isEditorial
          ? 'rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 hover:shadow-md dark:bg-zinc-800 dark:ring-zinc-600'
          : 'rounded-3xl bg-gray-200 shadow-md hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-700',
      ].join(' ')}
    >
      <div
        className={[
          'relative min-h-0 overflow-hidden bg-gray-200 dark:bg-zinc-600',
          isEditorial ? 'aspect-[4/5]' : 'aspect-square bg-gray-200 dark:bg-zinc-600',
        ].join(' ')}
      >
        {detailTo ? (
          <Link
            to={detailTo}
            className="absolute inset-0 z-10"
            aria-label={`Ver detalle de ${nombre}`}
          />
        ) : null}

        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white shadow-md backdrop-blur-sm transition hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label={favorite ? `Quitar ${nombre} de favoritos` : `Añadir ${nombre} a favoritos`}
          aria-pressed={favorite}
        >
          <span className={favorite ? 'text-rose-400' : 'text-white'}>
            {favorite ? <HeartFilled /> : <HeartOutline />}
          </span>
        </button>
        {currentImageSrc ? (
          <>
            {!imageLoaded && (
              <div
                className="absolute inset-0 bg-gray-200 animate-pulse dark:bg-zinc-700"
                aria-hidden
              />
            )}
            <img
              src={currentImageSrc}
              alt={nombre}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              className={[
                'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-sm font-medium text-stone-500 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className={['flex flex-1 flex-col gap-3', isEditorial ? 'p-5' : 'px-4 pb-5 pt-4'].join(' ')}>
        <div>
          {detailTo ? (
            <h3
              className={[
                'font-bold leading-snug text-black dark:text-zinc-100',
                isEditorial ? 'font-serif text-lg tracking-tight' : 'text-base',
              ].join(' ')}
            >
              <Link to={detailTo} className="relative z-10 hover:text-emerald-800 dark:hover:text-emerald-400">
                {nombre}
              </Link>
            </h3>
          ) : (
            <h3
              className={[
                'font-bold leading-snug text-black dark:text-zinc-100',
                isEditorial ? 'font-serif text-lg tracking-tight' : 'text-base',
              ].join(' ')}
            >
              {nombre}
            </h3>
          )}
          <p
            className={`mt-1 text-sm font-semibold text-black dark:text-zinc-100 ${isEditorial ? 'text-stone-800 dark:text-zinc-200' : ''}`}
          >
            {precio}
          </p>
          <p className="mt-1 text-xs text-black/60 dark:text-zinc-400">
            {medidas} · {sucursal}
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={[
            'relative z-20 mt-auto inline-flex w-full items-center justify-center rounded-full px-4 py-3.5 text-sm font-medium shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
            isEditorial
              ? 'border border-stone-200 bg-white text-stone-800 hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40'
              : 'bg-[#25D366] hover:scale-[1.02] hover:shadow-lg dark:ring-1 dark:ring-emerald-500/30',
          ].join(' ')}
          aria-label={`Cotizar ${nombre} por WhatsApp`}
        >
          {isEditorial ? (
            <span className="flex items-center gap-2">
              <WhatsAppIcon />
              Cotizar
            </span>
          ) : (
            <WhatsAppIcon />
          )}
        </a>
      </div>
    </article>
  )
}

export default MirrorProductCard

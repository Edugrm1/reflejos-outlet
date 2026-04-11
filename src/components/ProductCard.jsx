import React from 'react'
import { toast } from 'sonner'
import { useFavorites } from '@/hooks/useFavorites'
import { useUserRole } from '@/hooks/useUserRole'

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const HeartOutline = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

const HeartFilled = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.002.001h-.002z" />
  </svg>
)

/**
 * @param {{ imageUrl: string, productName?: string, specs?: string[], productId?: string }} props
 */
const ProductCard = ({ imageUrl, productName = 'Producto', specs = [], productId }) => {
  const { user } = useUserRole()
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const whatsappUrl = `https://wa.me/526181541157?text=${encodeURIComponent(`Hola, me interesa: ${productName}`)}`

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

  return (
    <article className="bg-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative aspect-square rounded-t-xl overflow-hidden bg-gray-200">
        {productId ? (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white shadow backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label={favorite ? `Quitar ${productName} de favoritos` : `Añadir ${productName} a favoritos`}
            aria-pressed={favorite}
          >
            <span className={favorite ? 'text-rose-400' : 'text-white'}>
              {favorite ? <HeartFilled /> : <HeartOutline />}
            </span>
          </button>
        ) : null}
        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">{productName}</h3>
          {specs.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {specs.map((spec, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-400">•</span>
                  {spec}
                </li>
              ))}
            </ul>
          )}
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#20bd5a] transition-colors mt-auto"
        >
          <WhatsAppIcon />
          WhatsApp
        </a>
      </div>
    </article>
  )
}

export default ProductCard

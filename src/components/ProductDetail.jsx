import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import {
  buildWhatsappProductDetailUrl,
  formatPriceMXNLabel,
  normalizeBranch,
  optimizeCloudinaryUrl,
} from '@/utils/mirrors'
import VirtualMirrorTryOn from './VirtualMirrorTryOn'

const CATEGORY_LABELS = {
  redondos: 'Espejos Redondos',
  rectangulares: 'Espejos Rectangulares',
  modernos: 'Espejos Modernos',
  dePiso: 'Espejos de piso',
  otros: 'Espejos',
}

const getCategoryLabel = (value) => {
  const v = String(value ?? '').toLowerCase()
  return CATEGORY_LABELS[v] ?? (value ? `Espejos ${String(value)}` : 'Espejos Reflejos Outlet')
}

const parseStock = (m) => {
  const v = m.stock ?? m.unidades ?? m.cantidad
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

const getStockStatus = (stock) => {
  if (stock === 0) return 'sin'
  if (stock < 10) return 'bajo'
  return 'ok'
}

const stockBadgeClass = (status) => {
  if (status === 'ok') return 'bg-emerald-500 text-white'
  if (status === 'bajo') return 'bg-amber-500 text-white'
  return 'bg-rose-500 text-white'
}

const stockBadgeText = (status) => {
  if (status === 'ok') return 'En Stock'
  if (status === 'bajo') return 'Stock Bajo'
  return 'Sin Stock'
}

const WhatsAppIcon = () => (
  <svg className="h-6 w-6 md:h-7 md:w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

/**
 * Ficha de producto: Firestore `Espejos/{id}` e imagen principal + CTA WhatsApp.
 */
const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mainLoaded, setMainLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!id) {
        setError('Producto no encontrado.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const snap = await getDoc(doc(db, 'Espejos', id))
        if (cancelled) return
        if (!snap.exists()) {
          setProduct(null)
          setError('notfound')
        } else {
          setProduct({ ...snap.data(), id: snap.id })
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'No se pudo cargar el producto.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const rawMainSrc = useMemo(() => {
    if (!product) return ''
    return String(product.imagenUrl ?? product.imageUrl ?? '').trim()
  }, [product])
  const optimizedMainSrc = useMemo(() => optimizeCloudinaryUrl(rawMainSrc), [rawMainSrc])
  const [mainSrc, setMainSrc] = useState(optimizedMainSrc)

  useEffect(() => {
    setMainSrc(optimizedMainSrc)
  }, [optimizedMainSrc])

  useEffect(() => {
    setMainLoaded(false)
  }, [mainSrc])

  const handleMainImageError = () => {
    if (mainSrc !== rawMainSrc && rawMainSrc) {
      setMainSrc(rawMainSrc)
      setMainLoaded(false)
      return
    }
    setMainLoaded(true)
  }

  const nombre = product?.nombre ?? product?.name ?? 'Espejo'
  const categoriaRaw = product?.categoria ?? product?.category ?? 'otros'
  const categoryLabel = getCategoryLabel(categoriaRaw)
  const medidas = product?.medidas ?? product?.medida ?? product?.size ?? ''
  const material = product?.material ?? product?.materialMarco ?? product?.material_marco ?? ''
  const sku = product?.sku ?? product?._sku ?? ''
  const sucursal = product ? normalizeBranch(product.sucursal) : ''
  const descripcion =
    product?.descripcion ?? product?.description ?? product?.detalle ?? ''

  const stock = product ? parseStock(product) : 0
  const stockStatus = getStockStatus(stock)

  const specRows = useMemo(() => {
    if (!product) return []
    const rows = [
      { label: 'Medidas', value: medidas },
      { label: 'Material del marco', value: material },
      { label: 'SKU', value: sku },
      { label: 'Sucursal', value: sucursal },
      { label: 'Stock', value: stock > 0 ? `${stock} ${stock === 1 ? 'unidad' : 'unidades'}` : 'Sin unidades' },
    ]
    return rows.filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== '')
  }, [product, medidas, material, sku, sucursal, stock])

  const descriptionParagraphs = useMemo(() => {
    const text = String(descripcion || '').trim()
    if (text) {
      return text
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    }
    return [
      `Pieza de la línea ${categoryLabel}. ${medidas ? `Medidas: ${medidas}.` : ''} Diseño pensado para aportar luz y amplitud a tu espacio.`,
      `${sucursal ? `Disponible en ${sucursal}. ` : ''}Cotiza por WhatsApp para precio, envío a toda la República y asesoría personalizada.`,
    ]
  }, [descripcion, categoryLabel, medidas, sucursal])

  const whatsappUrl = product ? buildWhatsappProductDetailUrl(nombre) : '#'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-pulse rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
              <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-zinc-700" />
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-10 w-full max-w-md animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'notfound' || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-zinc-950">
        <p className="text-center text-lg text-gray-700 dark:text-zinc-300">
          No encontramos este producto.
        </p>
        <button
          type="button"
          onClick={() => navigate('/catalogo')}
          className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Volver al catálogo
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-zinc-950">
        <p className="text-center text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={() => navigate('/catalogo')}
          className="mt-6 text-sm font-semibold text-emerald-700 underline dark:text-emerald-400"
        >
          Ir al catálogo
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <Link to="/" className="transition hover:text-gray-900 dark:hover:text-zinc-100">
              Inicio
            </Link>
            <span aria-hidden className="text-gray-300 dark:text-zinc-600">
              /
            </span>
            <Link to="/catalogo" className="transition hover:text-gray-900 dark:hover:text-zinc-100">
              Catálogo
            </Link>
            <span aria-hidden className="text-gray-300 dark:text-zinc-600">
              /
            </span>
            <span className="font-medium text-gray-900 dark:text-zinc-100">{nombre}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Columna imagen */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-8 lg:p-10">
                <div className="relative aspect-square w-full min-h-0 overflow-hidden rounded-2xl bg-gray-200 shadow-inner dark:bg-zinc-800/80">
                  {mainSrc ? (
                    <>
                      {!mainLoaded && (
                        <div
                          className="absolute inset-0 z-[1] bg-gray-200 animate-pulse dark:bg-zinc-700"
                          aria-hidden
                        />
                      )}
                      <img
                        src={mainSrc}
                        alt={nombre}
                        className={`relative z-[1] h-full w-full object-cover transition-opacity duration-300 ${
                          mainLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        onLoad={() => setMainLoaded(true)}
                        onError={handleMainImageError}
                      />
                    </>
                  ) : (
                    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-500">
                      Sin imagen
                    </div>
                  )}
                  <div
                    className={`absolute right-4 top-4 z-[2] rounded-full px-4 py-2 text-xs font-semibold shadow-sm sm:text-sm ${stockBadgeClass(stockStatus)}`}
                  >
                    {stockBadgeText(stockStatus)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna info */}
          <div className="pt-0 lg:pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 sm:text-sm">
              {categoryLabel}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-zinc-50 sm:text-4xl md:text-5xl">
              {nombre}
            </h1>

            <div className="mt-6 border-b border-gray-200 pb-8 dark:border-zinc-700">
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-50 sm:text-4xl">
                {formatPriceMXNLabel(product.precio ?? product.price)}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">IVA incluido</p>
            </div>

            <div className="mt-8 border-b border-gray-200 pb-8 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Descripción</h2>
              <div className="mt-4 space-y-4 text-gray-700 dark:text-zinc-300">
                {descriptionParagraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {specRows.length > 0 && (
              <div className="mt-8 border-b border-gray-200 pb-8 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                  Especificaciones Técnicas
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
                  {specRows.map((row) => (
                    <div key={row.label}>
                      <dt className="text-sm text-gray-600 dark:text-zinc-400">{row.label}</dt>
                      <dd className="mt-1 font-semibold text-gray-900 dark:text-zinc-100">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="border-b border-gray-200 pb-8 dark:border-zinc-700">
              <VirtualMirrorTryOn mirrorImageSrc={mainSrc} productName={nombre} productKey={id} />
            </div>

            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/20">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
              >
                <WhatsAppIcon />
                Cotizar por WhatsApp
              </a>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
                Respuesta inmediata • Envío a toda la República
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

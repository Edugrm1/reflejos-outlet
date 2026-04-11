import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import MirrorGallery from '@/components/MirrorGallery'

const HERO_FALLBACK_SRC =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80'

/** Categorías estáticas (enlace al catálogo completo). */
const STATIC_CATEGORIES = [
  {
    slug: 'redondos',
    title: 'Redondos',
    subtitle: 'Forma clásica, luz y profundidad',
    tone: 'from-amber-50 to-stone-100',
  },
  {
    slug: 'rectangulares',
    title: 'Rectangulares',
    subtitle: 'Líneas limpias para cualquier muro',
    tone: 'from-slate-100 to-zinc-100',
  },
  {
    slug: 'modernos',
    title: 'Modernos',
    subtitle: 'Diseño contemporáneo',
    tone: 'from-emerald-50/80 to-stone-50',
  },
  {
    slug: 'dePiso',
    title: 'De piso',
    subtitle: 'Presencia y escala',
    tone: 'from-neutral-100 to-stone-100',
  },
]

/**
 * Landing editorial: hero, categorías estáticas y 4 destacados desde Firestore.
 */
const Home = () => {
  const [mirrors, setMirrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [heroSrc, setHeroSrc] = useState('/hero-home.png')

  useEffect(() => {
    const ref = collection(db, 'Espejos')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setMirrors(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
        setLoading(false)
      },
      () => {
        setError('No se pudieron cargar los destacados.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  /** Hasta 4 piezas: prioriza las que tienen imagen, luego orden estable por id. */
  const destacados = useMemo(() => {
    const withImg = mirrors.filter((m) => m.imagenUrl || m.imageUrl)
    const rest = mirrors.filter((m) => !m.imagenUrl && !m.imageUrl)
    const merged = [...withImg, ...rest]
    return merged.slice(0, 4)
  }, [mirrors])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      {/* —— Hero estilo revista —— */}
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-stone-900">
        {/* Imagen + capa de contraste (legibilidad del contenido) */}
        <div className="absolute inset-0">
          <div className="relative h-full min-h-[72vh] w-full lg:min-h-[78vh]">
            <img
              src={heroSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setHeroSrc(HERO_FALLBACK_SRC)}
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden />
          </div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 lg:min-h-[78vh] lg:pb-24 lg:pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300 drop-shadow-md">
            Reflejos Outlet
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-light leading-[1.1] tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
            style={{ fontFamily: '"Dancing Script", cursive' }}
          >
            Donde el espacio se vuelve reflejo
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-100 drop-shadow-md sm:text-lg">
            Espejería decorativa en Durango y Chihuahua. Diseño contemporáneo y asesoría cercana.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/catalogo"
              className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-lg transition-all duration-200 ease-out hover:scale-105 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:focus-visible:outline-indigo-300"
            >
              Ver catálogo
            </Link>
            <Link
              to="/nosotros"
              className="inline-flex items-center rounded-full border-2 border-white bg-transparent px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Nuestra historia
            </Link>
          </div>
        </div>
      </section>

      {/* —— Categorías (estáticas) —— */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20" aria-labelledby="categorias-heading">
        <div className="mb-10 flex flex-col gap-2 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="categorias-heading"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-zinc-500"
            >
              Colecciones
            </h2>
            <p className="mt-2 font-serif text-3xl font-medium text-stone-900 sm:text-4xl dark:text-zinc-100">
              Categorías
            </p>
          </div>
          <Link
            to="/catalogo"
            className="text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            Ver todo el inventario →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STATIC_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to="/catalogo"
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-sm ring-1 ring-stone-200/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-md dark:from-zinc-800 dark:to-zinc-900 dark:ring-zinc-600 ${cat.tone}`}
            >
              <span className="block font-serif text-xl font-semibold text-stone-900 group-hover:text-emerald-900 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                {cat.title}
              </span>
              <span className="mt-2 block text-sm leading-snug text-stone-600 dark:text-zinc-400">
                {cat.subtitle}
              </span>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-stone-500 group-hover:text-emerald-800 dark:text-zinc-500 dark:group-hover:text-emerald-400">
                Explorar
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* —— Destacados: solo 4 desde Firestore —— */}
      <section
        className="border-t border-stone-200/80 bg-white py-16 dark:border-zinc-700 dark:bg-zinc-900 sm:py-20"
        aria-labelledby="destacados-heading"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center sm:mb-14">
            <h2
              id="destacados-heading"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-zinc-500"
            >
              Selección
            </h2>
            <p className="mt-2 font-serif text-3xl font-medium text-stone-900 sm:text-4xl dark:text-zinc-100">
              Destacados
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-stone-600 dark:text-zinc-400">
              Cuatro piezas de nuestro catálogo en vivo. Cotiza por WhatsApp con un clic.
            </p>
          </div>

          {error && (
            <p className="mb-8 text-center text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <MirrorGallery
            loading={loading}
            items={destacados}
            variant="editorial"
            skeletonCount={4}
            gridGapClass="gap-8"
            emptyState={
              <p className="text-center text-sm text-stone-500 dark:text-zinc-400">
                Pronto habrá piezas destacadas. Mientras tanto,{' '}
                <Link
                  to="/catalogo"
                  className="font-semibold text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  visita el catálogo
                </Link>
                .
              </p>
            }
          />

          <div className="mt-12 text-center">
            <Link
              to="/catalogo"
              className="inline-flex rounded-full border border-stone-300 bg-stone-50 px-8 py-3 text-sm font-semibold text-stone-800 transition hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/30"
            >
              Catálogo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Teaser nosotros */}
      <section className="border-t border-stone-200 bg-stone-100 px-5 py-12 dark:border-zinc-700 dark:bg-zinc-900 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-zinc-400">
            Durango · Chihuahua — emprendimiento familiar desde 2025.
          </p>
          <Link
            to="/nosotros"
            className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400"
          >
            Conócenos
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

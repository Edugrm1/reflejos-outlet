import React, { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { db } from '@/firebaseConfig'
import SearchBar from '@/components/SearchBar'
import MirrorGallery from '@/components/MirrorGallery'
import { useFavorites } from '@/hooks/useFavorites'
import { useUserRole } from '@/hooks/useUserRole'

/**
 * Lista de espejos marcados como favoritos (misma estructura visual que el catálogo).
 */
const Favorites = () => {
  const location = useLocation()
  const { user, loading: authLoading } = useUserRole()
  const { favoriteIds, loading: favLoading } = useFavorites()
  const [mirrors, setMirrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const ref = collection(db, 'Espejos')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setMirrors(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
        setLoading(false)
      },
      (err) => {
        setError(err?.message ? 'No se pudo cargar el catálogo.' : 'Error de conexión.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const filtered = useMemo(() => {
    const base = mirrors.filter((m) => m.id && favoriteSet.has(m.id))
    const q = searchTerm.trim().toLowerCase()
    if (!q) return base
    return base.filter((m) => {
      const nombre = (m.nombre ?? m.name ?? '').toLowerCase()
      const sku = String(m.sku ?? '').toLowerCase()
      return nombre.includes(q) || sku.includes(q)
    })
  }, [mirrors, favoriteSet, searchTerm])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 transition-colors dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="mt-6 h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const galleryLoading = loading || favLoading

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-zinc-950">
      <div className="border-b border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
            Mis favoritos
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Espejos que guardaste · {favoriteIds.length} en tu lista
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 sm:p-5">
          <SearchBar onSearch={setSearchTerm} className="w-full max-w-full px-0 py-0" />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <MirrorGallery
          loading={galleryLoading}
          items={filtered}
          variant="default"
          skeletonCount={8}
          emptyState={
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {favoriteIds.length === 0
                  ? 'Aún no tienes favoritos. Explora el catálogo y toca el corazón en un espejo.'
                  : 'Ningún favorito coincide con tu búsqueda.'}
              </p>
              <Link
                to="/catalogo"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
              >
                Ir al catálogo
              </Link>
            </div>
          }
        />

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-zinc-500">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} mostrado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

export default Favorites

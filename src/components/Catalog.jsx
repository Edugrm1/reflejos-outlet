import React, { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import SearchBar from '@/components/SearchBar'
import MirrorGallery from '@/components/MirrorGallery'
import { normalizeBranch } from '@/utils/mirrors'
import { getBranchChipClass } from '@/utils/catalogBranchChips'

const BRANCHES = ['Todas', 'Durango', 'Chihuahua']

/**
 * Catálogo completo: barra de búsqueda, filtros por sucursal y rejilla tipo tienda.
 */
const Catalog = () => {
  const [mirrors, setMirrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('Todas')

  useEffect(() => {
    setLoading(true)
    setError('')
    const ref = collection(db, 'Espejos')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        // `id` del documento debe ir al final: si en datos hay campo `id`, no debe pisar el ID de Firestore
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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    let list = mirrors

    if (selectedBranch !== 'Todas') {
      list = list.filter((m) => normalizeBranch(m.sucursal) === selectedBranch)
    }

    if (q) {
      list = list.filter((m) => {
        const nombre = (m.nombre ?? m.name ?? '').toLowerCase()
        const sku = String(m.sku ?? '').toLowerCase()
        return nombre.includes(q) || sku.includes(q)
      })
    }

    return list
  }, [mirrors, searchTerm, selectedBranch])

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-zinc-950">
      <div className="border-b border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            Inventario en tiempo real · Filtra por sucursal o busca por nombre o SKU
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Barra de búsqueda (componente existente) */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 sm:p-5">
          <SearchBar onSearch={setSearchTerm} className="w-full max-w-full px-0 py-0" />
        </div>

        {/* Filtros sucursal — chips visibles en claro y oscuro */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Sucursal</span>
          <div
            className="inline-flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-800/80"
            role="group"
            aria-label="Filtrar por sucursal"
          >
            {BRANCHES.map((b) => {
              const active = selectedBranch === b
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBranch(b)}
                  className={getBranchChipClass(b, active)}
                >
                  {b}
                </button>
              )
            })}
          </div>
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
          loading={loading}
          items={filtered}
          variant="default"
          skeletonCount={8}
          emptyState={
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-600 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              No hay productos que coincidan con tu búsqueda o sucursal.
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

export default Catalog

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { toast } from 'sonner'
import ProductSkeleton from '@/components/ProductSkeleton'
import { MIRROR_GRID_CLASS } from '@/components/MirrorGallery'
import { optimizeCloudinaryUrl } from '@/utils/mirrors'

// —— Constantes de categoría (valores en Firestore + etiqueta para UI) ——
const CATEGORY_OPTIONS = [
  { value: 'redondos', label: 'Redondos' },
  { value: 'rectangulares', label: 'Rectangulares' },
  { value: 'modernos', label: 'Modernos' },
  { value: 'dePiso', label: 'De piso' },
  { value: 'otros', label: 'Otros' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'todos', label: 'Estado: Todos' },
  { value: 'ok', label: 'En Stock' },
  { value: 'bajo', label: 'Stock Bajo' },
  { value: 'sin', label: 'Sin Stock' },
]

const formatCurrency = (value) => {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(number)
}

/** Obtiene unidades numéricas desde el documento (stock, unidades o cantidad). */
const parseStock = (m) => {
  const v = m.stock ?? m.unidades ?? m.cantidad
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

/**
 * Reglas de negocio: sin stock = 0; stock bajo = 1–9; en stock = ≥10.
 */
const getStockStatus = (stock) => {
  if (stock === 0) return 'sin'
  if (stock < 10) return 'bajo'
  return 'ok'
}

const getCategoryLabel = (value) => {
  const found = CATEGORY_OPTIONS.find((c) => c.value === value)
  return found?.label ?? (value ? String(value) : 'Sin categoría')
}

/** Clases Tailwind para badge de categoría (mockup: pills de color). */
const categoryBadgeClass = (value) => {
  const v = String(value ?? '').toLowerCase()
  if (v.includes('redondo')) return 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300'
  if (v.includes('rectangular')) return 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300'
  if (v.includes('moderno')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (v.includes('piso')) return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
  return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
}

/** Badge de estado de inventario. */
const statusBadgeClass = (status) => {
  if (status === 'ok') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
  if (status === 'bajo') return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
}

const statusLabel = (status) => {
  if (status === 'ok') return 'En Stock'
  if (status === 'bajo') return 'Stock Bajo'
  return 'Sin Stock'
}

const emptyForm = () => ({
  nombre: '',
  sku: '',
  categoria: 'redondos',
  precio: '',
  stock: '0',
  medidas: '',
  sucursal: '',
  descripcion: '',
})

/**
 * Panel de inventario: resumen, filtros, tabla y modal agregar/editar.
 * Mantiene onSnapshot en tiempo real y subida de imagen vía Cloudinary.
 */
const AdminDashboard = () => {
  const [mirrors, setMirrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadingById, setUploadingById] = useState({})

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todos')

  const [showProductModal, setShowProductModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const cloudinaryUrl = useMemo(() => {
    if (!cloudName) return ''
    return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  }, [cloudName])

  useEffect(() => {
    const ref = collection(db, 'Espejos')
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setMirrors(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })))
        setLoading(false)
      },
      () => {
        setError('No se pudo cargar el panel de administración.')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  /** Documentos enriquecidos con stock numérico y estado derivado. */
  const enriched = useMemo(() => {
    return mirrors.map((m) => {
      const stock = parseStock(m)
      const status = getStockStatus(stock)
      const sku = m.sku?.trim() || `REF-${String(m.id).slice(0, 8)}`
      const categoria = m.categoria ?? m.category ?? 'otros'
      return { ...m, _stock: stock, _status: status, _sku: sku, _categoria: categoria }
    })
  }, [mirrors])

  /** Métricas de las 4 tarjetas superiores. */
  const stats = useMemo(() => {
    const total = enriched.length
    const enStock = enriched.filter((m) => m._status === 'ok').length
    const stockBajo = enriched.filter((m) => m._status === 'bajo').length
    const sinStock = enriched.filter((m) => m._status === 'sin').length
    return { total, enStock, stockBajo, sinStock }
  }, [enriched])

  const uniqueCategories = useMemo(() => {
    const set = new Set(enriched.map((m) => String(m._categoria)))
    return Array.from(set).sort()
  }, [enriched])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enriched.filter((m) => {
      const nombre = (m.nombre ?? m.name ?? '').toLowerCase()
      const sku = m._sku.toLowerCase()
      if (q && !nombre.includes(q) && !sku.includes(q)) return false
      if (filterCategory !== 'todas' && String(m._categoria) !== filterCategory) return false
      if (filterStatus !== 'todos' && m._status !== filterStatus) return false
      return true
    })
  }, [enriched, search, filterCategory, filterStatus])

  const uploadToCloudinary = async (file) => {
    if (!cloudinaryUrl || !uploadPreset) {
      throw new Error('Faltan variables de entorno de Cloudinary (cloud name / upload preset).')
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    const res = await fetch(cloudinaryUrl, { method: 'POST', body: formData })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error?.message || 'Error subiendo la imagen.')
    if (!data?.secure_url) throw new Error('Cloudinary no devolvió secure_url.')
    return data.secure_url
  }

  const uploadImageForMirror = async (mirrorId, file) => {
    if (!file) return
    setError('')
    setUploadingById((s) => ({ ...s, [mirrorId]: true }))
    try {
      const secureUrl = await uploadToCloudinary(file)
      await updateDoc(doc(db, 'Espejos', mirrorId), { imagenUrl: secureUrl })
      toast.success('Espejo registrado exitosamente')
    } catch (e) {
      const message = e?.message || 'No se pudo subir la imagen.'
      setError(message)
      toast.error(message)
    } finally {
      setUploadingById((s) => ({ ...s, [mirrorId]: false }))
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setForm(emptyForm())
    setImageFile(null)
    setShowProductModal(true)
  }

  const openEditModal = useCallback((m) => {
    setEditingId(m.id)
    setForm({
      nombre: m.nombre ?? m.name ?? '',
      sku: m.sku ?? m._sku ?? '',
      categoria: m._categoria ?? 'otros',
      precio: String(m.precio ?? m.price ?? ''),
      stock: String(parseStock(m)),
      medidas: m.medidas ?? m.medida ?? m.size ?? '',
      sucursal: m.sucursal ?? '',
      descripcion: m.descripcion ?? m.description ?? m.detalle ?? '',
    })
    setImageFile(null)
    setShowProductModal(true)
  }, [])

  const closeModal = () => {
    setShowProductModal(false)
    setEditingId(null)
    setForm(emptyForm())
    setImageFile(null)
  }

  /** Guardar producto (crear o actualizar) + imagen opcional a Cloudinary. */
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const precioNum = Number(String(form.precio).replace(/,/g, ''))
      const stockNum = Math.max(0, Math.floor(Number(form.stock) || 0))
      const descripcion = form.descripcion.trim()
      const payload = {
        nombre: form.nombre.trim(),
        sku: form.sku.trim() || undefined,
        categoria: form.categoria,
        precio: Number.isFinite(precioNum) ? precioNum : 0,
        stock: stockNum,
        medidas: form.medidas.trim() || undefined,
        sucursal: form.sucursal.trim() || undefined,
        descripcion,
      }

      let imagenUrl
      if (imageFile) {
        imagenUrl = await uploadToCloudinary(imageFile)
      }

      if (editingId) {
        const updates = { ...payload }
        if (imagenUrl) updates.imagenUrl = imagenUrl
        await updateDoc(doc(db, 'Espejos', editingId), updates)
        toast.success('Producto actualizado')
      } else {
        await addDoc(collection(db, 'Espejos'), {
          ...payload,
          ...(imagenUrl ? { imagenUrl } : {}),
        })
        toast.success('Producto agregado')
      }
      closeModal()
    } catch (err) {
      const message = err?.message || 'No se pudo guardar el producto.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Eliminar producto. Listo para conectar reglas de Firestore.
   * @param {object} m — documento enriquecido
   */
  const handleDelete = async (m) => {
    const ok = window.confirm(`¿Eliminar "${m.nombre ?? m.name}" del inventario?`)
    if (!ok) return
    try {
      await deleteDoc(doc(db, 'Espejos', m.id))
      toast.success('Producto eliminado')
    } catch (err) {
      toast.error(err?.message || 'No se pudo eliminar.')
    }
  }

  /**
   * Editar desde la tabla (abre el mismo formulario).
   * Puedes sustituir esta función por navegación a otra pantalla si lo prefieres.
   */
  const handleEdit = (m) => openEditModal(m)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* —— Cabecera + botón principal —— */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-50">
              Inventario de Productos
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Gestiona tu catálogo de espejos</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            + Agregar Producto
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* —— Tarjetas de resumen (valores dinámicos desde Firestore) —— */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen de inventario">
          <SummaryCard
            label="Total Productos"
            value={loading ? '—' : stats.total}
            iconBg="bg-sky-100 dark:bg-sky-950/40"
            icon={
              <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            trend={{ text: '—', className: 'text-slate-400 dark:text-zinc-500' }}
          />
          <SummaryCard
            label="En Stock"
            value={loading ? '—' : stats.enStock}
            iconBg="bg-emerald-100 dark:bg-emerald-950/40"
            icon={
              <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            trend={{ text: '—', className: 'text-slate-400 dark:text-zinc-500' }}
          />
          <SummaryCard
            label="Stock Bajo"
            value={loading ? '—' : stats.stockBajo}
            iconBg="bg-amber-100 dark:bg-amber-950/40"
            icon={
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            trend={{ text: '—', className: 'text-slate-400 dark:text-zinc-500' }}
          />
          <SummaryCard
            label="Sin Stock"
            value={loading ? '—' : stats.sinStock}
            iconBg="bg-rose-100 dark:bg-rose-950/40"
            icon={
              <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            trend={{ text: '—', className: 'text-slate-400 dark:text-zinc-500' }}
          />
        </section>

        {/* —— Barra: búsqueda + filtros —— */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-[65%]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-1">
              <div className="relative flex-1">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <option value="todas">Todas las categorías</option>
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>
                      {getCategoryLabel(c)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">▾</span>
              </div>
              <div className="relative flex-1">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">▾</span>
              </div>
            </div>
          </div>
        </div>

        {/* —— Tabla de inventario (esqueletos tipo tarjeta mientras carga Firebase) —— */}
        {loading ? (
          <div className={`${MIRROR_GRID_CLASS} gap-5`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} variant="default" />
            ))}
          </div>
        ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-zinc-700">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/80">
                  {['PRODUCTO', 'CATEGORÍA', 'PRECIO', 'STOCK', 'ESTADO', 'ACCIONES'].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6 dark:text-zinc-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                      No hay productos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((m) => {
                    const nombre = m.nombre ?? m.name ?? 'Sin nombre'
                    const imagenUrl = m.imagenUrl ?? m.imageUrl ?? ''
                    const precio = formatCurrency(m.precio ?? m.price)
                    const stock = m._stock
                    const status = m._status
                    const stockClass =
                      status === 'sin'
                        ? 'text-rose-600 font-semibold dark:text-rose-400'
                        : status === 'bajo'
                          ? 'text-amber-600 font-semibold dark:text-amber-400'
                          : 'text-slate-900 font-semibold dark:text-zinc-100'

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white dark:bg-zinc-700 dark:ring-zinc-900">
                              {imagenUrl ? (
                                <img
                                  src={optimizeCloudinaryUrl(imagenUrl)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400 dark:text-zinc-500">—</div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-zinc-100">{nombre}</p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">SKU: {m._sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryBadgeClass(m._categoria)}`}
                          >
                            {getCategoryLabel(m._categoria)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900 sm:px-6 dark:text-zinc-100">{precio}</td>
                        <td className={`px-4 py-4 sm:px-6 ${stockClass}`}>
                          {stock} {stock === 1 ? 'unidad' : 'unidades'}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}
                          >
                            {statusLabel(status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(m)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                              title="Editar"
                              aria-label={`Editar ${nombre}`}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                              title="Eliminar"
                              aria-label={`Eliminar ${nombre}`}
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <label className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400" title="Subir imagen">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={Boolean(uploadingById[m.id])}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) uploadImageForMirror(m.id, file)
                                  e.target.value = ''
                                }}
                              />
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </label>
                            {uploadingById[m.id] && <span className="text-xs text-slate-500 dark:text-zinc-400">Subiendo…</span>}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* —— Modal Agregar / Editar producto —— */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60"
            aria-label="Cerrar"
            onClick={closeModal}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {editingId ? 'Editar producto' : 'Agregar producto'}
            </h2>
            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <Field label="Nombre" required>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </Field>
              <Field label="SKU">
                <input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="REF-001"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </Field>
              <Field label="Categoría">
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </Field>
              </div>
              <Field label="Medidas">
                <input
                  value={form.medidas}
                  onChange={(e) => setForm((f) => ({ ...f, medidas: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={5}
                  placeholder="Texto que verán los clientes en la ficha del producto. Deja vacío para usar el texto sugerido por defecto."
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </Field>
              <Field label="Sucursal">
                <input
                  value={form.sucursal}
                  onChange={(e) => setForm((f) => ({ ...f, sucursal: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </Field>
              <Field label="Imagen (opcional)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700 dark:text-zinc-400"
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/** Tarjeta de métrica del resumen superior. */
function SummaryCard({ label, value, icon, iconBg, trend }) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className={`absolute right-4 top-4 text-xs font-semibold ${trend.className}`}>{trend.text}</span>
      <div className={`mb-3 inline-flex rounded-lg p-2 ${iconBg}`}>{icon}</div>
      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-zinc-50">{value}</p>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
      {label}
      {required && <span className="text-rose-500"> *</span>}
      {children}
    </label>
  )
}

export default AdminDashboard

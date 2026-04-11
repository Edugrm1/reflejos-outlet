import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserRole } from '@/hooks/useUserRole'

/**
 * Probador virtual: foto de pared + espejo arrastrable y escalable (solo cliente).
 */
export function VirtualMirrorTryOn({ mirrorImageSrc, productName, productKey }) {
  const { user, loading } = useUserRole()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [roomBg, setRoomBg] = useState(null)
  /** Posición del centro del espejo en % del contenedor */
  const [pos, setPos] = useState({ x: 50, y: 45 })
  /** Escala visual del espejo (0.25 – 1.6) */
  const [mirrorScale, setMirrorScale] = useState(0.55)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setRoomBg(null)
    setPos({ x: 50, y: 45 })
    setMirrorScale(0.55)
  }, [productKey])

  const loadFileAsDataUrl = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setRoomBg(reader.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const onFileInputChange = (e) => {
    const f = e.target.files?.[0]
    loadFileAsDataUrl(f)
    e.target.value = ''
  }

  const onDropRoom = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files?.[0]
    loadFileAsDataUrl(f)
  }

  const onDragOverRoom = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const setPositionFromClient = useCallback((clientX, clientY) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    setPos({
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(3, Math.min(97, y)),
    })
  }, [])

  const onMirrorMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => setPositionFromClient(e.clientX, e.clientY)
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, setPositionFromClient])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const clearRoom = () => {
    setRoomBg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!mirrorImageSrc) return null

  if (loading) {
    return (
      <div
        className="mt-8 h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-800"
        aria-hidden
      />
    )
  }

  if (!user) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              Espejo en mi habitación
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
              Inicia sesión para subir una foto de tu pared y ver cómo luce este espejo.
            </p>
          </div>
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              Espejo en mi habitación
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
              Sube una foto de tu espacio y coloca el espejo para visualizarlo en proporción.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70"
          >
            Abrir probador virtual
          </button>
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="virtual-tryon-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Cerrar probador"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-[1] flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-zinc-800">
              <h3 id="virtual-tryon-title" className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                Probador virtual
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
                  Elegir foto de mi pared
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onFileInputChange}
                  />
                </label>
                {roomBg && (
                  <button
                    type="button"
                    onClick={clearRoom}
                    className="text-sm font-medium text-gray-600 underline-offset-2 hover:underline dark:text-zinc-400"
                  >
                    Quitar foto
                  </button>
                )}
              </div>

              <div
                ref={containerRef}
                onDrop={onDropRoom}
                onDragOver={onDragOverRoom}
                className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800"
                style={
                  roomBg
                    ? {
                        backgroundImage: `url(${roomBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderStyle: 'solid',
                      }
                    : undefined
                }
              >
                {!roomBg && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-gray-500 dark:text-zinc-400">
                    <span className="font-medium text-gray-700 dark:text-zinc-300">
                      Arrastra aquí una imagen o usa &quot;Elegir foto&quot;
                    </span>
                    <span className="text-xs">Formatos: JPG, PNG, WebP…</span>
                  </div>
                )}

                {roomBg && mirrorImageSrc && (
                  <img
                    src={mirrorImageSrc}
                    alt={productName ? `Vista previa: ${productName}` : 'Espejo'}
                    draggable={false}
                    onMouseDown={onMirrorMouseDown}
                    className={`absolute max-h-[70%] w-auto max-w-[65%] select-none ${
                      dragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) scale(${mirrorScale})`,
                      pointerEvents: 'auto',
                    }}
                  />
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="mirror-scale" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Tamaño del espejo
                  </label>
                  <span className="tabular-nums text-xs text-gray-500 dark:text-zinc-500">
                    {Math.round(mirrorScale * 100)}%
                  </span>
                </div>
                <input
                  id="mirror-scale"
                  type="range"
                  min={25}
                  max={160}
                  step={1}
                  value={Math.round(mirrorScale * 100)}
                  onChange={(e) => setMirrorScale(Number(e.target.value) / 100)}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-600 dark:bg-zinc-700 dark:accent-emerald-500"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-zinc-500">
                  Arrastra el espejo sobre la foto para colocarlo. Ajusta el deslizador para que coincida con el tamaño real de tu espacio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VirtualMirrorTryOn

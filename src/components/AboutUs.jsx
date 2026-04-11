import React, { useEffect, useState } from 'react'

/**
 * Bloque con animación de entrada suave (fade + slide) sin dependencias extra.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.delayMs] — retardo antes de animar
 * @param {string} [props.className]
 */
function Reveal({ children, delayMs = 0, className = '' }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setActive(true), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs])

  return (
    <div
      className={[
        'transform transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0',
        active ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

/**
 * Página "Nosotros": historia, misión y visión de Reflejos Outlet.
 * Diseño minimalista, acento esmeralda alineado con el resto del sitio.
 */
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Cabecera de página */}
      <header className="border-b border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:max-w-4xl lg:px-8 lg:py-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              Reflejos Outlet
            </p>
            <h1
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-zinc-50"
              style={{ fontFamily: '"Dancing Script", cursive' }}
            >
              Nosotros
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-zinc-400">
              Espejería decorativa con alma contemporánea y trato cercano, nacida en el norte de México.
            </p>
          </Reveal>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:max-w-5xl lg:px-8 lg:py-14">
        {/* Placeholder visual: se adapta al ancho, proporción cinematográfica */}
        <Reveal delayMs={100} className="mb-12 lg:mb-16">
          <figure className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/20 dark:ring-zinc-800">
            <div className="aspect-[21/9] w-full min-h-[140px] sm:min-h-[200px] bg-gradient-to-br from-slate-100 via-amber-50/40 to-emerald-50/60 dark:from-zinc-800 dark:via-amber-950/30 dark:to-emerald-950/40">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
                alt="Interior con espejo decorativo"
                className="h-full w-full object-cover opacity-95 transition duration-500 hover:scale-[1.02] hover:opacity-100"
                loading="lazy"
              />
            </div>
            <figcaption className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-500 sm:text-sm dark:border-zinc-700 dark:text-zinc-400">
              Ambientes que reflejan tu estilo
            </figcaption>
          </figure>
        </Reveal>

        {/* Nuestra Historia */}
        <Reveal delayMs={200} className="mb-12 lg:mb-16">
          <section
            aria-labelledby="historia-heading"
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none"
          >
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                aria-hidden
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <h2 id="historia-heading" className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-zinc-50">
                Nuestra historia
              </h2>
            </div>
            <div className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-[17px] dark:text-zinc-400">
              <p>
                <strong className="font-semibold text-slate-800 dark:text-zinc-100">Reflejos Outlet</strong> nació en{' '}
                <strong className="font-semibold text-slate-800 dark:text-zinc-100">julio de 2025</strong>, en{' '}
                <strong className="font-semibold text-amber-700 dark:text-amber-400">Durango</strong>, como un{' '}
                <strong className="font-semibold text-slate-800 dark:text-zinc-100">emprendimiento familiar</strong> con una idea clara:
                llenar un <strong className="font-semibold text-slate-800 dark:text-zinc-100">hueco en el mercado</strong> de cristalería y
                espejería <strong className="font-semibold text-slate-800 dark:text-zinc-100">contemporánea</strong>, cercana a las
                personas y con propuestas que realmente transformen los espacios del día a día.
              </p>
              <p>
                Lo que empezó en casa creció con el mismo cuidado con el que elegimos cada marco y cada acabado. Un hito
                importante fue la apertura de nuestra{' '}
                <strong className="font-semibold text-sky-700 dark:text-sky-400">sucursal en Chihuahua</strong> en{' '}
                <strong className="font-semibold text-slate-800 dark:text-zinc-100">diciembre de 2025</strong>, un paso que nos acerca a más
                familias y proyectos en el norte del país, sin perder nuestra esencia de trato personalizado.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Misión y Visión en rejilla responsive */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal delayMs={320}>
            <section
              aria-labelledby="mision-heading"
              className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:shadow-lg dark:hover:shadow-black/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </span>
                <h2 id="mision-heading" className="text-xl font-bold text-slate-900 dark:text-zinc-50">
                  Misión
                </h2>
              </div>
              <blockquote className="border-l-4 border-emerald-500/70 pl-4 text-base italic leading-relaxed text-slate-600 sm:text-[17px] dark:text-zinc-400">
                Proveer soluciones de espejería decorativa de alta calidad que transformen espacios, combinando diseño
                contemporáneo y atención personalizada.
              </blockquote>
            </section>
          </Reveal>

          <Reveal delayMs={420}>
            <section
              aria-labelledby="vision-heading"
              className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:shadow-lg dark:hover:shadow-black/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400"
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </span>
                <h2 id="vision-heading" className="text-xl font-bold text-slate-900 dark:text-zinc-50">
                  Visión
                </h2>
              </div>
              <blockquote className="border-l-4 border-slate-300 pl-4 text-base italic leading-relaxed text-slate-600 sm:text-[17px] dark:border-zinc-600 dark:text-zinc-400">
                Consolidarnos para el año <strong className="font-semibold not-italic text-slate-800 dark:text-zinc-100">2030</strong> como
                la empresa líder en comercialización de espejos de diseño en el{' '}
                <strong className="font-semibold not-italic text-slate-800 dark:text-zinc-100">norte de México</strong>.
              </blockquote>
            </section>
          </Reveal>
        </div>

        {/* Cierre suave */}
        <Reveal delayMs={520} className="mt-12 text-center lg:mt-16">
          <p className="text-sm text-slate-500 dark:text-zinc-500">
            <span className="font-medium text-amber-700 dark:text-amber-400">Durango</span> ·{' '}
            <span className="font-medium text-sky-700 dark:text-sky-400">Chihuahua</span> ·{' '}
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Reflejos Outlet</span>
          </p>
        </Reveal>
      </main>
    </div>
  )
}

export default AboutUs

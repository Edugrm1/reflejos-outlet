import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'
import { useUserRole } from '@/hooks/useUserRole'
import ThemeToggle from '@/components/ThemeToggle'

/** Estilos base + activo (subrayado marca) para enlaces del menú principal. */
const navLinkClass = ({ isActive }) =>
  [
    'text-sm transition-colors hover:opacity-90',
    'border-b-2 pb-0.5',
    isActive
      ? 'border-emerald-600 font-bold text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
      : 'border-transparent font-medium text-black dark:text-zinc-100',
  ].join(' ')

/**
 * Barra de navegación:
 * - Público: Inicio, Nosotros, Catálogo (+ Iniciar sesión si no hay usuario).
 * - Autenticado: Cerrar sesión para cualquier usuario.
 * - Administrador: enlace al panel solo si `usuarios/{uid}.role === 'admin'`.
 */
const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, isAdmin } = useUserRole()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch {
      /* seguir con navegación */
    } finally {
      navigate('/', { replace: true })
    }
  }

  const showPublicAuth = !loading && !user
  const showUserMenu = !loading && user

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/95 shadow-sm backdrop-blur-xl transition-colors dark:border-zinc-700/90 dark:bg-zinc-950/95 dark:shadow-zinc-950/20 dark:backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="shrink-0 text-2xl text-black sm:text-3xl dark:text-zinc-100"
          style={{ fontFamily: '"Dancing Script", cursive' }}
        >
          Reflejos Outlet
        </Link>

          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md border border-neutral-300 p-2 text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-4 hidden flex-wrap items-center justify-end gap-5 lg:gap-7 sm:flex">
          {/* `end`: solo activo en "/" exacto; sin esto "/" coincide con todas las rutas por prefijo */}
          <NavLink to="/" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/nosotros" className={navLinkClass}>
            Nosotros
          </NavLink>
          <NavLink to="/catalogo" className={navLinkClass}>
            Catálogo
          </NavLink>

          {showUserMenu && (
            <NavLink to="/favoritos" className={navLinkClass}>
              Favoritos
            </NavLink>
          )}

          {showPublicAuth && (
            <NavLink to="/login" className={navLinkClass}>
              Iniciar sesión
            </NavLink>
          )}

          {showUserMenu && (
            <>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    [
                      'text-xs sm:text-sm',
                      'border-b-2 pb-0.5 transition-colors',
                      isActive
                        ? 'border-emerald-600 font-bold text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                        : 'border-transparent font-medium text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-200',
                    ].join(' ')
                  }
                >
                  Administrador
                </NavLink>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 rounded-sm dark:text-zinc-400 dark:hover:text-rose-400 dark:focus-visible:ring-rose-500/50"
              >
                Cerrar sesión
              </button>
            </>
          )}

          <ThemeToggle />
        </nav>

        {mobileOpen && (
          <nav
            id="mobile-menu"
            className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:hidden"
          >
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/nosotros" className={navLinkClass}>
              Nosotros
            </NavLink>
            <NavLink to="/catalogo" className={navLinkClass}>
              Catálogo
            </NavLink>

            {showUserMenu && (
              <NavLink to="/favoritos" className={navLinkClass}>
                Favoritos
              </NavLink>
            )}

            {showPublicAuth && (
              <NavLink to="/login" className={navLinkClass}>
                Iniciar sesión
              </NavLink>
            )}

            {showUserMenu && (
              <>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      [
                        'block text-sm border-b-2 pb-0.5 transition-colors',
                        isActive
                          ? 'border-emerald-600 font-bold text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                          : 'border-transparent font-medium text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-200',
                      ].join(' ')
                    }
                  >
                    Administrador
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block text-sm font-medium text-neutral-600 transition-colors hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 rounded-sm dark:text-zinc-400 dark:hover:text-rose-400 dark:focus-visible:ring-rose-500/50"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default NavBar

import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  const { user, loading, isAdmin } = useUserRole()

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

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/95 shadow-sm backdrop-blur-xl transition-colors dark:border-zinc-700/90 dark:bg-zinc-950/95 dark:shadow-zinc-950/20 dark:backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-5 lg:px-8 px-4">
        <Link
          to="/"
          className="shrink-0 text-2xl text-black sm:text-3xl dark:text-zinc-100"
          style={{ fontFamily: '"Dancing Script", cursive' }}
        >
          Reflejos Outlet
        </Link>

        <nav className="flex flex-wrap items-center justify-start gap-3 sm:justify-end sm:gap-5 lg:gap-7">
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
      </div>
    </header>
  )
}

export default NavBar

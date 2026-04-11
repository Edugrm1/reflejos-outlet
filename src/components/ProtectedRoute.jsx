import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserRole } from '@/hooks/useUserRole'

/**
 * Protege rutas de administración: exige sesión válida y documento
 * `usuarios/{uid}` con `role: 'admin'`.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { user, loading, isAdmin } = useUserRole()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-zinc-950">
        <div className="text-sm text-slate-600 dark:text-zinc-400">Verificando permisos…</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

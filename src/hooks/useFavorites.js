import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '@/firebaseConfig'
import { useUserRole } from '@/hooks/useUserRole'

const USERS_COLLECTION = 'users'

const FavoritesContext = createContext(null)

/**
 * Proveedor: una sola suscripción a `users/{uid}.favorites` para toda la app.
 */
export function FavoritesProvider({ children }) {
  const { user } = useUserRole()
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoriteIds([])
      setLoading(false)
      return
    }

    setLoading(true)
    const ref = doc(db, USERS_COLLECTION, user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const raw = snap.data()?.favorites
        const list = Array.isArray(raw)
          ? raw.map(String).filter((id) => id.length > 0)
          : []
        setFavoriteIds(list)
        setLoading(false)
      },
      () => {
        setLoading(false)
        toast.error('No se pudieron cargar tus favoritos.')
      }
    )
    return () => unsub()
  }, [user])

  const addToFavorites = useCallback(
    async (productId) => {
      if (!user) return
      const id = String(productId)
      if (!id) return

      setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      try {
        await setDoc(
          doc(db, USERS_COLLECTION, user.uid),
          { favorites: arrayUnion(id) },
          { merge: true }
        )
      } catch {
        setFavoriteIds((prev) => prev.filter((x) => x !== id))
        toast.error('No se pudo guardar en favoritos. Intenta de nuevo.')
      }
    },
    [user]
  )

  const removeFromFavorites = useCallback(
    async (productId) => {
      if (!user) return
      const id = String(productId)
      if (!id) return

      setFavoriteIds((prev) => prev.filter((x) => x !== id))
      try {
        await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
          favorites: arrayRemove(id),
        })
      } catch {
        setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        toast.error('No se pudo quitar de favoritos. Intenta de nuevo.')
      }
    },
    [user]
  )

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(String(productId)),
    [favoriteIds]
  )

  const value = useMemo(
    () => ({
      favoriteIds,
      loading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
    }),
    [favoriteIds, loading, addToFavorites, removeFromFavorites, isFavorite]
  )

  return React.createElement(FavoritesContext.Provider, { value }, children)
}

/**
 * @returns {{
 *   favoriteIds: string[]
 *   loading: boolean
 *   addToFavorites: (productId: string) => Promise<void>
 *   removeFromFavorites: (productId: string) => Promise<void>
 *   isFavorite: (productId: string) => boolean
 * }}
 */
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  }
  return ctx
}

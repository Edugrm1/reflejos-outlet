import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebaseConfig'

/** Nombre de la colección donde vive el perfil con `role` (ID doc = UID de Auth). */
const USUARIOS_COLLECTION = 'usuarios'

/**
 * Sincroniza sesión de Firebase Auth con el documento `usuarios/{uid}`.
 * @returns {{ user: import('firebase/auth').User | null, role: string | null, loading: boolean, isAdmin: boolean }}
 */
export function useUserRole() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeProfile()
      setUser(currentUser)
      setAuthLoading(false)

      if (!currentUser) {
        setRole(null)
        setProfileLoading(false)
        return
      }

      setProfileLoading(true)
      const userRef = doc(db, USUARIOS_COLLECTION, currentUser.uid)

      unsubscribeProfile = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            setRole(typeof data?.role === 'string' ? data.role : null)
          } else {
            setRole(null)
          }
          setProfileLoading(false)
        },
        () => {
          setRole(null)
          setProfileLoading(false)
        }
      )
    })

    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  const loading = authLoading || (user !== null && profileLoading)
  const isAdmin = Boolean(user && role === 'admin')

  return { user, role, loading, isAdmin }
}

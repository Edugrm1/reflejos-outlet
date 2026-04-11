import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebaseConfig'
import { useTheme } from '@/context/ThemeContext.jsx'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop'

const FORM_BG_DARK = '#171311'
const CARD_BG_DARK = '#1f1c19'
const CARD_BORDER_DARK = '#3d3530'

const FORM_BG_LIGHT = '#fafaf9'
const CARD_BG_LIGHT = '#ffffff'
const CARD_BORDER_LIGHT = '#e7e5e4'

const IconUser = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const IconMail = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const IconLock = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
)

const IconEye = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const IconEyeOff = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
)

/**
 * Registro público: mismo layout que Login (split-screen) + Auth + `usuarios/{uid}` con role `cliente`.
 */
const Register = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const isDark = theme === 'dark'

  const inputBase =
    'w-full rounded-xl border py-3 pl-10 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500'
  const inputDark = `${inputBase} border-stone-600 bg-[#141210] text-stone-100 placeholder-stone-500`
  const inputLight = `${inputBase} border-stone-200 bg-white text-stone-800 placeholder-stone-400`
  const iconMuted = isDark ? 'text-stone-500' : 'text-stone-400'

  const heroOverlayStyle = useMemo(() => {
    const formEdge = isDark ? FORM_BG_DARK : FORM_BG_LIGHT
    return {
      background: isDark
        ? `linear-gradient(90deg, transparent 0%, transparent 12%, rgba(23, 19, 17, 0.35) 42%, rgba(23, 19, 17, 0.82) 72%, ${formEdge} 100%), linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 35%, rgba(0,0,0,0.28) 100%)`
        : `linear-gradient(90deg, transparent 0%, transparent 15%, rgba(250, 250, 249, 0.45) 55%, rgba(250, 250, 249, 0.92) 82%, ${formEdge} 100%)`,
    }
  }, [isDark])

  const formColumnStyle = useMemo(
    () => ({ backgroundColor: isDark ? FORM_BG_DARK : FORM_BG_LIGHT }),
    [isDark]
  )

  const cardStyle = useMemo(
    () => ({
      backgroundColor: isDark ? CARD_BG_DARK : CARD_BG_LIGHT,
      borderColor: isDark ? CARD_BORDER_DARK : CARD_BORDER_LIGHT,
    }),
    [isDark]
  )

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    let createdUser = null

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      createdUser = credential.user

      await setDoc(doc(db, 'usuarios', createdUser.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        role: 'cliente',
        createdAt: serverTimestamp(),
      })

      navigate('/', { replace: true })
    } catch (err) {
      const code = err?.code ?? ''

      if (createdUser) {
        try {
          await deleteUser(createdUser)
        } catch {
          /* ignorar */
        }
      }

      const message =
        code === 'auth/email-already-in-use'
          ? 'Este correo ya está registrado.'
          : code === 'auth/invalid-email'
            ? 'El correo no es válido.'
            : code === 'auth/weak-password'
              ? 'La contraseña es demasiado débil (mínimo 6 caracteres).'
              : code === 'auth/network-request-failed'
                ? 'Error de red. Intenta de nuevo.'
                : 'No se pudo completar el registro. Intenta de nuevo.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      <div className="relative hidden min-h-screen md:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden
        />
        <div className="absolute inset-0" style={heroOverlayStyle} aria-hidden />
        <div className="relative z-[1] flex h-full min-h-screen flex-col justify-end p-10 lg:p-14">
          <p
            className="text-4xl font-semibold leading-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
            style={{ fontFamily: '"Dancing Script", cursive' }}
          >
            Reflejos Outlet
          </p>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-white/95 lg:text-xl">
            Encuentra tu estilo. Espejos y decoración que transforman tu espacio.
          </p>
        </div>
      </div>

      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-y-auto px-5 py-10 sm:px-8"
        style={formColumnStyle}
      >
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="absolute left-4 top-4 flex items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:left-6 sm:top-6"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </button>

        <div className="w-full max-w-md pt-10">
          <div className="rounded-2xl border p-8 shadow-sm sm:p-10" style={cardStyle}>
            <div className="mb-8 text-center">
              <h1
                className={`text-2xl font-bold tracking-tight ${isDark ? 'text-stone-100' : 'text-stone-800'}`}
              >
                Crear cuenta
              </h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Regístrate como cliente y guarda tus favoritos
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label
                  htmlFor="reg-nombre"
                  className={`mb-2 block text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconMuted}`}
                    aria-hidden
                  >
                    <IconUser className="h-5 w-5" />
                  </span>
                  <input
                    id="reg-nombre"
                    type="text"
                    autoComplete="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Tu nombre"
                    className={isDark ? inputDark : inputLight}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className={`mb-2 block text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                >
                  Correo
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconMuted}`}
                    aria-hidden
                  >
                    <IconMail className="h-5 w-5" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="tu@email.com"
                    className={isDark ? inputDark : inputLight}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className={`mb-2 block text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconMuted}`}
                    aria-hidden
                  >
                    <IconLock className="h-5 w-5" />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    placeholder="Mínimo 6 caracteres"
                    className={`${isDark ? inputDark : inputLight} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
                      isDark
                        ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-200'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className={`mb-2 block text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconMuted}`}
                    aria-hidden
                  >
                    <IconLock className="h-5 w-5" />
                  </span>
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    placeholder="Repite tu contraseña"
                    className={`${isDark ? inputDark : inputLight} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={loading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
                      isDark
                        ? 'text-stone-400 hover:bg-stone-700/50 hover:text-stone-200'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirmPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[#171311]"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>

              {error && (
                <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <p className={`text-center text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

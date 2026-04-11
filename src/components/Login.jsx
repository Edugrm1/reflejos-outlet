import React, { useMemo, useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth, googleAuthProvider } from '@/firebaseConfig'
import { useTheme } from '@/context/ThemeContext.jsx'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop'

const FORM_BG_DARK = '#171311'
const CARD_BG_DARK = '#1f1c19'
const CARD_BORDER_DARK = '#3d3530'

const FORM_BG_LIGHT = '#fafaf9'
const CARD_BG_LIGHT = '#ffffff'
const CARD_BORDER_LIGHT = '#e7e5e4'

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

/** Logo Google (colores oficiales aproximados) */
const GoogleLogo = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const Login = ({ onBack, onSuccess }) => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleBack = () => {
    if (onBack) onBack()
    else navigate('/', { replace: true })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      setLoading(false)
      onSuccess?.(credential.user)
      navigate(from, { replace: true })
    } catch (err) {
      const code = err?.code ?? ''
      const message =
        code === 'auth/invalid-credential' || code === 'auth/wrong-password'
          ? 'Credenciales incorrectas. Revisa tu email y contraseña.'
          : code === 'auth/user-not-found'
            ? 'No existe una cuenta con este email.'
            : code === 'auth/too-many-requests'
              ? 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
              : 'No se pudo iniciar sesión. Intenta de nuevo.'

      setError(message)
      setLoading(false)
    }
  }

  /** Login con Google en ventana emergente (no redirige la pestaña; usa signInWithPopup, no signInWithRedirect). */
  const handleGoogleLogin = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider)
      setGoogleLoading(false)
      onSuccess?.(credential.user)
      navigate(from, { replace: true })
    } catch (err) {
      const code = err?.code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setGoogleLoading(false)
        return
      }
      const message =
        code === 'auth/popup-blocked'
          ? 'El navegador bloqueó la ventana emergente. Permite ventanas para este sitio.'
          : code === 'auth/account-exists-with-different-credential'
            ? 'Ya existe una cuenta con este email usando otro método de acceso.'
            : code === 'auth/unauthorized-domain'
              ? 'Dominio no autorizado en Firebase. Revisa la configuración.'
              : 'No se pudo iniciar sesión con Google. Intenta de nuevo.'
      setError(message)
      setGoogleLoading(false)
    }
  }

  const isDark = theme === 'dark'
  const busy = loading || googleLoading

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
        className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8"
        style={formColumnStyle}
      >
        <button
          type="button"
          onClick={handleBack}
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
                Iniciar sesión
              </h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Accede con tu email para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className={`mb-2 block text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}
                >
                  Email
                </label>
                <div className="relative">
                  <span
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconMuted}`}
                    aria-hidden
                  >
                    <IconMail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={busy}
                    placeholder="tu@email.com"
                    className={isDark ? inputDark : inputLight}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
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
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={busy}
                    placeholder="••••••••"
                    className={`${isDark ? inputDark : inputLight} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={busy}
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

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[#171311]"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center py-2">
                <div
                  className={`grow border-t ${isDark ? 'border-stone-600' : 'border-stone-200'}`}
                  aria-hidden
                />
                <span
                  className={`mx-4 shrink-0 text-xs font-medium uppercase tracking-wide ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  O inicia sesión con
                </span>
                <div
                  className={`grow border-t ${isDark ? 'border-stone-600' : 'border-stone-200'}`}
                  aria-hidden
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                className={`mt-4 flex w-full items-center justify-center gap-3 rounded-xl border py-3.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[#1f1c19] ${
                  isDark
                    ? 'border-stone-600 bg-[#141210] text-stone-100 hover:bg-[#1a1715]'
                    : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
                }`}
              >
                {googleLoading ? (
                  <span className="text-stone-500">Conectando con Google…</span>
                ) : (
                  <>
                    <GoogleLogo />
                    Iniciar sesión con Google
                  </>
                )}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-6 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <p className={`mt-6 text-center text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

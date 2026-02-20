'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/supabase/auth'
import { useAuth } from '@/lib/context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'login' | 'register' | 'post-purchase'
  postPurchaseEmail?: string
  postPurchaseName?: string
}

type TabMode = 'login' | 'register'

export function AuthModal({
  isOpen,
  onClose,
  mode = 'login',
  postPurchaseEmail = '',
  postPurchaseName = '',
}: AuthModalProps) {
  const { customerName } = useAuth()
  const [tab, setTab] = useState<TabMode>(mode === 'register' ? 'register' : 'login')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    email: postPurchaseEmail,
    name: postPurchaseName,
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isPostPurchase = mode === 'post-purchase'

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      // Page will redirect to Google — loading stays true until navigation
    } catch (err) {
      console.error('Google login error:', err)
      toast.error('Error al iniciar con Google. Intenta de nuevo.', {
        position: 'bottom-center',
        duration: 4000,
      })
      setIsGoogleLoading(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido'
    }

    if (tab === 'register' && !form.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }

    if (tab === 'register' && form.password !== form.confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsEmailLoading(true)
    try {
      if (tab === 'login') {
        await signInWithEmail(form.email, form.password)
        toast.success(
          `¡Bienvenido de nuevo${customerName ? `, ${customerName}` : ''}!`,
          { position: 'bottom-center', icon: '👋' }
        )
      } else {
        await signUpWithEmail(form.email, form.password, form.name)
        toast.success(
          '¡Cuenta creada! Revisa tu email para confirmar.',
          { position: 'bottom-center', icon: '🎉' }
        )
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      if (msg.includes('Invalid login credentials')) {
        setErrors({ password: 'Email o contraseña incorrectos' })
      } else if (msg.includes('User already registered')) {
        setErrors({ email: 'Ya existe una cuenta con este email' })
      } else {
        toast.error(msg, { position: 'bottom-center' })
      }
    } finally {
      setIsEmailLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors text-sm ${
      errors[field]
        ? 'border-red-500 focus:ring-red-500/30'
        : 'border-gray-700 focus:ring-[#c89b6e]/40 focus:border-[#c89b6e]'
    }`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-[#111111] rounded-2xl shadow-2xl border border-gray-800 pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    LUKESS{' '}
                    <span className="text-[#c89b6e] text-xs tracking-[0.25em] font-medium">
                      HOME
                    </span>
                  </span>
                  {isPostPurchase ? (
                    <div className="mt-2">
                      <p className="text-base font-bold text-white">
                        🎉 ¡Pedido realizado!
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Crea tu cuenta para ver tu historial de pedidos y
                        guardar tus favoritos
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">
                      Iniciar sesión / Crear cuenta
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Google button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      Redirigiendo a Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                      Continuar con Google
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500">o continúa con</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Tabs */}
                <div className="flex rounded-lg bg-[#1a1a1a] p-1 gap-1">
                  {(['login', 'register'] as TabMode[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTab(t)
                        setErrors({})
                      }}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                        tab === t
                          ? 'bg-[#c89b6e] text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {tab === 'register' && (
                    <div>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Nombre completo"
                        className={inputClass('name')}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="tucorreo@gmail.com"
                      className={inputClass('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Contraseña"
                        className={inputClass('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {tab === 'register' && (
                    <div>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={form.confirm}
                          onChange={(e) =>
                            setForm({ ...form, confirm: e.target.value })
                          }
                          placeholder="Confirmar contraseña"
                          className={inputClass('confirm')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirm && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.confirm}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="w-full bg-[#c89b6e] hover:bg-[#b8895e] text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isEmailLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>
                </form>

                {/* Post-purchase skip */}
                {isPostPurchase && (
                  <div className="text-center">
                    <button
                      onClick={onClose}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Puedes saltar este paso →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FaSignInAlt, FaEye, FaEyeSlash, FaDiscord } from 'react-icons/fa'

import { routes } from '@/core/constants/routes'

import { LoadingTransition } from './loading'
import { useLastLogin } from '../hooks/rememberMe'
import { useLogin } from '../hooks/useLogin'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { email, setEmail, password, setPassword, errors, isLoading, handleLogin } = useLogin()

  const { getLastLogin, saveLastLogin, clearLastLogin } = useLastLogin()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Sincroniza estado de loading
  useEffect(() => {
    if (!isLoading) {
      setIsTransitioning(false)
    }
  }, [isLoading])

  // Limpa estados quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setIsTransitioning(false)
    }
  }, [isOpen])

  // Load saved credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedLogin = getLastLogin()
      if (savedLogin) {
        setEmail(savedLogin.email)
        setPassword(savedLogin.password)
        setRememberMe(true)
      } else {
        setEmail('')
        setPassword('')
        setRememberMe(false)
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsTransitioning(true)
      const success = await handleLogin()

      if (success) {
        // Handle remembered credentials
        if (rememberMe) {
          saveLastLogin(email, password)
        } else {
          clearLastLogin()
        }

        // Keep transition active until navigation completes
        // Modal will be unmounted by route change
        onClose()
      } else {
        setIsTransitioning(false)
      }
    } catch (error) {
      setIsTransitioning(false)
    }
  }
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-black shadow-xl">
                <div className="relative p-8">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Logo */}
                  <motion.div
                    className="mb-8 flex justify-center"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="relative h-32 w-32">
                      <Image
                        src="/assets/images/og.png"
                        alt="Firebot Monitor"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {/* Email field */}
                      <div>
                        <label className="text-sm font-medium text-gray-300">Usuário</label>
                        <input
                          type="text"
                          className={`mt-1 w-full rounded-lg border ${
                            errors.email ? 'border-red-500' : 'border-gray-800'
                          } bg-black/50 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500`}
                          placeholder="Digite seu e-mail"
                          disabled={isLoading}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Password field */}
                      <div>
                        <label className="text-sm font-medium text-gray-300">Senha</label>
                        <div className="relative mt-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full rounded-lg border ${
                              errors.password ? 'border-red-500' : 'border-gray-800'
                            } bg-black/50 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500`}
                            placeholder="Digite sua senha"
                            disabled={isLoading}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                          </button>
                        </div>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500"
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={e => {
                          setRememberMe(e.target.checked)
                          if (!e.target.checked) {
                            clearLastLogin()
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-500 bg-black text-red-500 focus:ring-2 focus:ring-red-500"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                        Lembrar credenciais
                      </label>
                    </div>

                    {/* Submit button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 text-white transition-all hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-70"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            <span>Entrando...</span>
                          </>
                        ) : (
                          <>
                            <FaSignInAlt className="transition-transform group-hover:rotate-12" />
                            <span>Entrar</span>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.button>

                    {/* Discord button */}
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={routes.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/50 py-2.5 text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <FaDiscord className="text-xl" />
                      <span>Solicitar Demonstração</span>
                    </motion.a>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>{isTransitioning && <LoadingTransition />}</AnimatePresence>
    </>
  )
}

export default AuthModal

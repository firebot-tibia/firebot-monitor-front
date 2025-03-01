'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Custom404 = () => {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [_clickCount, setClickCount] = useState(0)
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
  }>>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 5) {
        setShowEasterEgg(true)
      }
      return newCount
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-purple-500/5 to-transparent" />

      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-red-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          x: mousePosition.x / 100,
          y: mousePosition.y / 100,
        }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, rotateY: 0 }}
          animate={{ scale: 1, rotateY: showEasterEgg ? 360 : 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotateY: 20 }}
          onClick={handleLogoClick}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            rotateY: { duration: 0.8 },
          }}
          className="mb-8 cursor-pointer"
        >
          <div className="relative h-40 w-40 drop-shadow-2xl">
            <Image
              src="/assets/images/og.png"
              alt="Firebot Monitor"
              fill
              className="object-contain"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
          </div>
        </motion.div>

        <AnimatePresence>
          {showEasterEgg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-16 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 p-3 text-white"
            >
              <p className="text-sm">Você encontrou um easter egg! 🔥</p>
              <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-orange-600" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mb-6 overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10 mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 bg-clip-text text-8xl font-black text-transparent"
          >
            404
          </motion.h1>

          <motion.div
            className="absolute left-0 top-0 z-0 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-8xl font-black text-transparent opacity-70"
            animate={{
              x: [0, -5, 10, -10, 5, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              textShadow: "3px 3px 6px rgba(255,100,50,0.2)"
            }}
          >
            404
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-2 text-3xl font-bold text-white"
        >
          Página não encontrada
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 max-w-md text-lg text-gray-400"
        >
          A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 font-medium text-white transition-all"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o Início
          </span>

          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 opacity-0 transition-opacity group-hover:opacity-100"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 text-gray-500 underline-offset-4 hover:text-gray-300 hover:underline"
          onClick={() => window.history.back()}
        >
          Voltar para página anterior
        </motion.button>
      </motion.div>

      <div
        className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-red-500/5"
        style={{
          transform: `translate(-50%, -50%) translate(${mousePosition.x / -50}px, ${mousePosition.y / -50}px)`
        }}
      />

      <div
        className="animation-delay-200 absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-500/5"
        style={{
          transform: `translate(-50%, -50%) translate(${mousePosition.x / -30}px, ${mousePosition.y / -30}px)`
        }}
      />

      <div
        className="animation-delay-500 absolute left-1/2 top-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-500/5"
        style={{
          transform: `translate(-50%, -50%) translate(${mousePosition.x / -80}px, ${mousePosition.y / -80}px)`
        }}
      />
    </div>
  )
}

export default Custom404

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const Custom404 = () => {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="mb-8"
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

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-6xl font-bold text-transparent"
        >
          404
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 text-2xl text-gray-400"
        >
          Página não encontrada
        </motion.p>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-8 py-3 text-white transition-all hover:shadow-lg hover:shadow-red-500/25"
        >
          <span className="relative z-10 flex items-center gap-2">
            Voltar para o Início
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.button>

        {/* Decorative elements */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-red-500/5" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-500/5 animation-delay-200" />
      </motion.div>
    </div>
  )
}

export default Custom404

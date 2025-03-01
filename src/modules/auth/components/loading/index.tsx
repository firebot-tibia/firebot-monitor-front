import { motion } from 'framer-motion'

export const LoadingSpinner = () => (
  <div className="relative h-24 w-24">
    {/* Outer spinner */}
    <div className="absolute inset-0 animate-spin-slow rounded-full border-4 border-transparent border-t-red-500 opacity-25" />
    {/* Inner spinner */}
    <div className="absolute inset-2 animate-spin-reverse rounded-full border-4 border-transparent border-t-orange-500 opacity-40" />
    {/* Center dot */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-4 w-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
    </div>
  </div>
)

export const LoadingTransition = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col items-center"
    >
      <LoadingSpinner />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-gray-400"
      >
        Carregando configurações do Firebot
      </motion.p>

      {/* Progress bar */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
          initial={{ width: '0%' }}
          animate={{
            width: '100%',
            transition: {
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            },
          }}
        />
      </div>
    </motion.div>
  </div>
)

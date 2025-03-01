import { motion } from 'framer-motion'

import { fadeInUp } from '../constants'

export const PricingFeature = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => (
  <motion.div variants={fadeInUp} className="flex items-center gap-3">
    <div className="text-red-400">{icon}</div>
    <div>
      <p className="font-bold text-white">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </motion.div>
)

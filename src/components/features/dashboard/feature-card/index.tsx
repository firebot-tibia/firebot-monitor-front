import { useState } from "react";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

import { staggerContainer, fadeInUp } from "../constants";
import type { Feature } from "../types";

export const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={{
        initial: { opacity: 0, y: 50 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay: index * 0.1
          }
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative w-full perspective-1000"
    >
      <motion.div
        animate={{
          rotateX: isHovered ? 2 : 0,
          rotateY: isHovered ? 2 : 0,
          scale: isHovered ? 1.02 : 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
        className="relative h-full overflow-hidden rounded-xl border border-red-500 bg-gradient-to-b from-black to-black/80 p-6 shadow-lg backdrop-blur-sm"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-orange-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 space-y-4">
          <motion.div
            className="flex items-center gap-4"
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-2 text-white shadow-lg transition-all duration-300 group-hover:shadow-red-500/25">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
          </motion.div>

          <p className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
            {feature.description}
          </p>

          <motion.div
            className="space-y-3"
            variants={staggerContainer}
          >
            {feature.premium.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  {item}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { FaInstagram, FaYoutube, FaGithub, FaDiscord } from 'react-icons/fa'

interface SocialLinkProps {
  href: string
  icon: typeof FaInstagram | typeof FaYoutube | typeof FaGithub | typeof FaDiscord
  label: string
  color: string
}

const SocialLink = ({ href, icon: Icon, label, color }: SocialLinkProps) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.2, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="group relative"
    aria-label={label}
  >
    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-500/0 via-red-500/10 to-orange-500/0 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
    <Icon
      className={`relative h-5 w-5 transition-colors duration-300 ${color} group-hover:text-red-500`}
    />
  </motion.a>
)

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks: (SocialLinkProps & { delay: number })[] = [
    {
      href: 'https://www.instagram.com/firebot_tibia/',
      icon: FaInstagram,
      label: 'Instagram',
      color: 'text-pink-400',
      delay: 0.1,
    },
    {
      href: 'https://www.youtube.com/@firebot-tibia',
      icon: FaYoutube,
      label: 'YouTube',
      color: 'text-red-500',
      delay: 0.2,
    },
    {
      href: 'https://discord.gg/firebot',
      icon: FaDiscord,
      label: 'Discord',
      color: 'text-indigo-400',
      delay: 0.3,
    },
    {
      href: 'https://github.com/ssbreno',
      icon: FaGithub,
      label: 'GitHub ssbreno',
      color: 'text-gray-400',
      delay: 0.4,
    },
    {
      href: 'https://github.com/matheusrps',
      icon: FaGithub,
      label: 'GitHub matheusrps',
      color: 'text-gray-400',
      delay: 0.5,
    },
  ]

  return (
    <footer className="relative w-full border-t border-red-500 bg-black py-8">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright and Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-2 md:items-start"
          >
            <h3 className="text-sm font-bold text-white">© Firebot | {currentYear}</h3>
            <p className="text-xs text-gray-500">Desenvolvido por ssbreno e matheusrps</p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-6"
          >
            {socialLinks.map((link, _index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: link.delay }}
              >
                <SocialLink {...link} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Divider with gradient */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-black px-4">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-red-500/20 via-red-500/40 to-red-500/20" />
            </div>
          </div>
        </div>

        {/* Legal Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-gray-600"
        >
          Tibia is a registered trademark of CipSoft GmbH. All products related to Tibia are
          copyright © by CipSoft GmbH.
        </motion.p>
      </div>
    </footer>
  )
}

export default Footer

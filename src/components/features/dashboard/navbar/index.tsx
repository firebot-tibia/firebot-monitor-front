'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Bot, HelpCircle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { routes } from '../../../../common/constants/routes'

const navItems = [
  { name: 'Home', icon: Home, path: routes.home },
  { name: 'Ferramentas', icon: Bot, path: routes.editor },
  { name: 'Suporte Discord', icon: HelpCircle, path: routes.discordUrl },
]

interface UnauthenticatedNavbarProps {
  onOpenModal: () => void
}

const UnauthenticatedNavbar: React.FC<UnauthenticatedNavbarProps> = ({ onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const NavContent = () => (
    <div className="flex flex-col gap-4">
      {navItems.map(item => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 transition-colors
            ${pathname === item.path ? 'bg-white/10' : 'hover:bg-white/20'}`}
          target={item.path === routes.discordUrl ? '_blank' : undefined}
        >
          <item.icon size={20} />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300
      ${isScrolled ? 'bg-black/80 shadow-lg backdrop-blur-md' : ''}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <span className="bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-xl font-bold text-transparent">
              Firebot
            </span>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex gap-4">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-300 transition-colors
                      ${pathname === item.path ? 'bg-white/10' : 'hover:bg-white/20'}`}
                    target={item.path === routes.discordUrl ? '_blank' : undefined}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Login and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>

            {isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/20"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 right-0 top-0 w-64 bg-black shadow-xl"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <span className="bg-gradient-to-r from-red-500 to-red-300 bg-clip-text font-bold text-transparent">
                Firebot
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <NavContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          style={{ zIndex: -1 }}
        />
      )}
    </nav>
  )
}

export default UnauthenticatedNavbar

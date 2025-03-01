'use client'

import { useDisclosure } from '@chakra-ui/react'

import AuthModal from '@/components/features/auth/components'
import BotDescriptions from '@/components/features/dashboard'
import UnauthenticatedNavbar from '@/components/features/dashboard/navbar'
import Footer from '@/components/layout/components/footer'

export default function Home() {
  const {
    isOpen: isAuthModalOpen,
    onOpen: onOpenAuthModal,
    onClose: onCloseAuthModal,
  } = useDisclosure()

  return (
    <>
      <UnauthenticatedNavbar onOpenModal={onOpenAuthModal} />
      <AuthModal isOpen={isAuthModalOpen} onClose={onCloseAuthModal} />
      <BotDescriptions />
      <Footer />
    </>
  )
}

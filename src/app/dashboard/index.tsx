'use client'

import { useDisclosure } from '@chakra-ui/react'

import AuthModal from '@/modules/auth/components'
import LandingPage from '@/modules/landing-page'
import UnauthenticatedNavbar from '@/modules/landing-page/navbar'
import Footer from '@/modules/layout/components/footer'

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
      <LandingPage />
      <Footer />
    </>
  )
}

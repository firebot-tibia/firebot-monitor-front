'use client'

import { useDisclosure as useChakraDisclosure } from '@chakra-ui/react'

import Footer from '@/components/layout/components/footer'

import AuthModal from '../auth/components'
import UnauthenticatedNavbar from '../dashboard/navbar'
import DescriptionEditor from './components/description'

const Editor = () => {
  const {
    isOpen: isAuthModalOpen,
    onOpen: onOpenAuthModal,
    onClose: onCloseAuthModal,
  } = useChakraDisclosure()

  return (
    <div className="min-h-screen bg-black">
      <UnauthenticatedNavbar onOpenModal={onOpenAuthModal} />
      <AuthModal isOpen={isAuthModalOpen} onClose={onCloseAuthModal} />
      <main className="container mx-auto px-4 py-8">
        <DescriptionEditor />
      </main>
      <Footer />
    </div>
  )
}

export default Editor

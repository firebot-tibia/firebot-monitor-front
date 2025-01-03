import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { ChakraProvider } from '@chakra-ui/react'

function render(ui: React.ReactElement, { session = null, ...options } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <ChakraProvider>{children}</ChakraProvider>
      </SessionProvider>
    )
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { render }

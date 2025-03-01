import { extendTheme } from '@chakra-ui/react'
import type { ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const styles = {
  global: {
    'html, body': {
      bg: '#000',
      color: 'white',
      fontFamily: 'var(--font-sans)',
    },
    '#__next': {
      bg: '#000',
      minHeight: '100vh',
    },
  },
}

const fonts = {
  heading: 'var(--font-sans)',
  body: 'var(--font-sans)',
}

const colors = {
  geist: {
    background: 'red.800',
    foreground: 'white',
    primary: 'red.800',
    secondary: '#666',
    success: '#0070f3',
    error: '#e00',
    warning: '#f5a623',
  },
}

const theme = extendTheme({ config, styles, fonts, colors })

export default theme

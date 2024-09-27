import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: {
    body: {
      bg: '#1c1c1c',
      color: 'white',
      fontFamily: 'var(--font-sans)',
    },
  },
};

const fonts = {
  heading: 'var(--font-sans)',
  body: 'var(--font-sans)',
};

const colors = {
  geist: {
    background: '#000',
    foreground: '#fff',
    primary: '#0070f3',
    secondary: '#666',
    success: '#0070f3',
    error: '#e00',
    warning: '#f5a623',
  },
};

const theme = extendTheme({ config, styles, fonts, colors });

export default theme;

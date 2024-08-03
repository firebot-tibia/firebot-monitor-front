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
      fontFamily: 'Neue Regrade, sans-serif',
    },
  },
};

const fonts = {
  heading: 'Neue Regrade, sans-serif',
  body: 'Neue Regrade, sans-serif',
};

const theme = extendTheme({ config, styles, fonts });

export default theme;

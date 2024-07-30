import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: '#1c1c1c',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
    },
  }),
};

const theme = extendTheme({ config, styles });

export default theme;

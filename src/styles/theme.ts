import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: 'black',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
    },
  }),
};

const theme = extendTheme({ config, styles });

export default theme;

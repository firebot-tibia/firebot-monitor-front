import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
    },
  }),
};

const theme = extendTheme({ config, styles });

export default theme;

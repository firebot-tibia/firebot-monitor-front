import { theme as chakraTheme, extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
    shadows: {
      table: '-5px 0px 6px 0px rgba(0,0,0,0.75)',
    },
    fonts: {
      ...chakraTheme.fonts,
    },
    sizes: {
      ...chakraTheme.sizes,
      menuOpen: {
        1: 272,
        0: 96,
      },
    },
    fontSizes: {
      ...chakraTheme.fontSizes,
      '3xs': '10px',
      '2xs': '12px',
      xs: '14px',
      sm: '16px',
      '2sm': '20px',
      md: '24px',
      '3md': '32px',
      '6md': '64px',
    },
    space: {
      ...chakraTheme.space,
      '6xs': '2px',
      '5xs': '4px',
      '4xs': '8px',
      '3xs': '10px',
      '2xs': '12px',
      xs: '16px',
      sm: '18px',
      md: '24px',
      '2md': '32px',
      '3md': '40px',
      xl: '48px',
      xxl: '56px',
      '3xl': '112px',
    },
    lineHeights: {
      ...chakraTheme.lineHeights,
      md: '32px',
    },
    borders: {
      ...chakraTheme.borders,
    },
    colors: {
      ...chakraTheme.colors,
  
      gray: {
        ...chakraTheme.colors.gray,
        50: '#F9F9F9',
        100: '#F3F3F4',
        200: '#E5E5E5',
        300: '#C3C8CD',
        400: '#ABABAB',
        500: '#868686',
        600: '#E2E3E6',
        700: '#7E8392',
        800: '#494949',
        900: '#0E0E0E',
      },
      blue: {
        ...chakraTheme.colors.blue,
        200: '#C4E4FF',
        500: '#2176FF',
        700: '#1662DC',
        600: '#1652DC',
        900: '#1254BF',
      },
      red: {
        100: '#FFF4F7',
        200: '#FFBDBD',
        500: '#FF2727',
        600: '#FF2620',
        700: '#00A661',
      },
      green: {
        ...chakraTheme.colors.green,
        400: '#D4ECDB',
        500: '#00C875',
        600: '#00C161',
      },
      orange: {
        ...chakraTheme.colors.orange,
        200: '#FEF2E0',
        500: '#FDAB3D',
      },
      black: {
        800: '#16171B',
        900: '#050B0F',
      },
      purple: {
        ...chakraTheme.colors.purple,
        500: '#9D21FF',
      },
      icon: {
        black: '#050B0F',
      },
    },
    textStyles: {
      legend: {
        fontSize: ['36px', '48px'],
        fontWeight: 'semibold',
        lineHeight: '110%',
        letterSpacing: '-1%',
        color: 'red',
      },
    },
});
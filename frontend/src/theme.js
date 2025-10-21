import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const colors = {
  brand: {
    50: '#e6f7f7',
    100: '#b3e6e6',
    200: '#80d5d5',
    300: '#4dc4c4',
    400: '#1ab3b3',
    500: '#0ea5e9', // Primary teal
    600: '#0b8ac3',
    700: '#086f9c',
    800: '#055475',
    900: '#02394e',
  },
};

const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'teal',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'teal.500' : 'teal.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'teal.600' : 'teal.600',
        },
      }),
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'md',
      },
    }),
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
});

export default theme;

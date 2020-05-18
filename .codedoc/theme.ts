import { createTheme, DefaultCodeThemeLight } from '@codedoc/core/transport';


export const theme = /*#__PURE__*/createTheme({
  light: {
    primary: '#7e80ff',
    background: '#ffffff',
  },
  dark: {
    primary: '#7f78d2',
    background: '#000000',
  },
  toc: {
    light: {
      background: '#fafafa',
    },
    dark: {
      background: '#111111',
    }
  },
  code: {
    light: {
      ...DefaultCodeThemeLight,
      shadow: 'none',
      background: '#ffffff',
      lineHightlight: '#fbeeff',
    },
    dark: {
      shadow: 'none',
      background: '#000000'
    }
  }
});

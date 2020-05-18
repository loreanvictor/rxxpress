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
  quote: {
    light: {
      background: '#fbeeff',
      border: '#ebc6ff',
      text: '#45046a',
    },
    dark: {
      background: '#202040',
      border: '#543864',
      text: '#fbeeff',
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
      background: '#000000',
      lineHightlight: '#202040',
    }
  }
});

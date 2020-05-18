
import { configuration } from '@codedoc/core';

import { theme } from './theme';


export const config = /*#__PURE__*/configuration({
  theme,
  dest: {
    namespace: '/rxxpress',
    html: 'dist',
    assets: process.env.GITHUB_BUILD === 'true' ? 'dist' : '.',
    bundle: process.env.GITHUB_BUILD === 'true' ? 'bundle' : 'dist/bundle',
    styles: process.env.GITHUB_BUILD === 'true' ? 'styles' : 'dist/styles',
  },
  page: {
    title: {
      base: 'RxXpress'
    },
    fonts: {
      text: {
        url: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap',
        name: 'Comfortaa'
      },
      code: {
        url: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap',
        name: 'DM Mono'
      }
    }
  },
  misc: {
    github: {
      user: 'loreanvictor',
      repo: 'rxxpress',
    }
  },
});

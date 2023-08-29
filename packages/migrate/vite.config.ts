/// <reference types="vitest" />

import {nxViteTsPaths} from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import {defineConfig} from 'vite';

import packageJson from './package.json';
import {lib} from '../../tools/scripts/vite-shared.ts';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/migrate',

  plugins: [
    lib({
      entry: 'src/index.ts',
      name: 'migrate',
      packageJson,
      projectDir: __dirname,
    }),

    nxViteTsPaths(),
  ],

  build: {
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [],
    },
  },
});

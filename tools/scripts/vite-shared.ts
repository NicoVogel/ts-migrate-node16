/// <reference types="vitest" />

import {execSync} from 'node:child_process';
import path from 'node:path';
import type {Plugin, PluginOption} from 'vite';
import dtsPlugin from 'vite-plugin-dts';
import {viteStaticCopy} from 'vite-plugin-static-copy';

function getShortHash() {
  try {
    return execSync('git describe --always').toString().trim();
  } catch (error) {
    return 'No git commit hash available';
  }
}

/**
 * set env variables COMMIT and VERSION
 */
export function env({packageJson}: {packageJson: {version: string}}): Plugin {
  return {
    name: 'env-config',
    config() {
      return {
        define: {
          // https://github.com/vitejs/vite/issues/3304
          // without the single quotes we would get the error: Uncaught SyntaxError: Invalid or unexpected token (at env.mjs)
          'import.meta.env.COMMIT': `'${getShortHash()}'`,
          'import.meta.env.VERSION': `'${packageJson.version}'`,
        },
      };
    },
  };
}

/**
 * copy readme, license and changelog
 */
export function standardCopy() {
  return viteStaticCopy({
    silent: false,
    targets: [
      ...['README.md'].map(file => ({
        src: file,
        dest: './',
      })),
    ],
  });
}

/**
 * create dts files
 */
export function dts({projectDir}: {projectDir: string}) {
  return dtsPlugin({
    entryRoot: 'src',
    tsConfigFilePath: path.join(projectDir, 'tsconfig.lib.json'),
    skipDiagnostics: true,
  });
}

/**
 * library build config
 */
export function libBase({
  entry,
  name,
}: {
  entry: string | string[];
  name?: string;
}): Plugin {
  return {
    name: 'lib-config',
    config() {
      return {
        build: {
          lib: {
            entry,
            fileName: name,
            formats: ['es', 'cjs'],
          },
        },
      };
    },
  };
}

export async function nodeExternals() {
  const {nodeExternals} = await import('rollup-plugin-node-externals');
  return {
    ...nodeExternals(),
    enforce: 'pre',
  } as PluginOption;
}

export function test(): Plugin {
  return {
    name: 'test-config',
    config() {
      return {
        test: {
          globals: false,
          cache: {
            dir: '../../node_modules/.vitest',
          },
          environment: 'node',
          include: ['src/**/*.{spec}.{ts,mts}'],
        },
      };
    },
  };
}

/**
 * setup library build
 */
export function lib(
  options: Parameters<typeof libBase>[0] &
    Parameters<typeof env>[0] &
    Parameters<typeof dts>[0]
): PluginOption[] {
  return [
    libBase(options),
    env(options),
    dts(options),
    ...standardCopy(),
    nodeExternals(),
    test(),
  ];
}

// rollup.config.js
import fs from 'node:fs';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));

const bannerContent = `
/**
/ Via Profit Services / Core
* 
* Repository ${packageJson.repository?.url || ''}
* Contact    ${packageJson.support || ''}
*/
`;

export default {
  input: path.resolve(__dirname, './src/index.ts'),
  output: {
    dir: path.resolve(__dirname, './dist/'),
    format: 'esm',
    sourcemap: false,
    entryFileNames: '[name].js',
  },
  plugins: [
    // Очистка dist перед сборкой
    {
      name: 'clean-dist',
      buildStart() {
        const distPath = path.resolve(__dirname, './dist/');
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true });
        }
      },
    },
    resolve({
      extensions: ['.ts', '.js'],
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false,
      declaration: false,
    }),
    // Баннер
    {
      name: 'banner-plugin',
      renderChunk(code, chunk) {
        if (chunk.fileName === 'index.js') {
          return bannerContent + '\n' + code;
        }
        return code;
      },
    },
    // Копирование .d.ts
    {
      name: 'copy-dts',
      writeBundle() {
        const sourceDts = path.resolve(__dirname, './src/@types/index.d.ts');
        const targetDts = path.resolve(__dirname, './dist/index.d.ts');
        if (fs.existsSync(sourceDts)) {
          fs.copyFileSync(sourceDts, targetDts);
        }
      },
    },
    // Анализатор бандла (опционально)
    process.env.ANALYZE && visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  external: [
    'graphql',
    'busboy',
    'supports-color',
    'express',
    '@via-profit-services/core',
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
  },
};
import fs from 'node:fs';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.resolve(__dirname, './src/index.ts');

const external = ['graphql', 'busboy', 'supports-color', 'express', '@via-profit-services/core'];

const basePlugins = [
  resolve({ extensions: ['.ts', '.js'], preferBuiltins: true }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: false,
    declaration: false,
  }),
  terser({ compress: { drop_console: true } }),
];

// Плагин копирования .d.ts
const copyDtsPlugin = {
  name: 'copy-dts',
  writeBundle() {
    const source = path.resolve(__dirname, './src/@types/index.d.ts');
    const target = path.resolve(__dirname, './dist/index.d.ts');
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
    }
  },
};

// ESM bundle
const esm = {
  input,
  output: {
    file: path.resolve(__dirname, './dist/index.js'),
    format: 'esm',
  },
  external,
  plugins: basePlugins,
};

// CJS bundle
const cjs = {
  input,
  output: {
    file: path.resolve(__dirname, './dist/index.cjs'),
    format: 'cjs',
  },
  external,
  plugins: [...basePlugins, copyDtsPlugin],
};

export default [esm, cjs];

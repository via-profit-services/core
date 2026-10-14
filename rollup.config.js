import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.resolve(__dirname, './src/index.ts');

// Everything from node_modules and Node.js built-ins stays external
const external = ['graphql', /^node:/];

const basePlugins = [
  resolve({ extensions: ['.ts', '.js'], preferBuiltins: true }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: false,
    declaration: false,
  }),
  // drop_console is not used: it silently removes every console.* call,
  // including error reporting
  terser(),
];

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
  plugins: basePlugins,
};

// Type declarations: generated from the sources and bundled into one file.
// One file is required: `declare module '@via-profit-services/core'` in a
// project merges into an interface (e.g. Context) only if the interface is
// declared in the module itself, not re-exported from another file.
const types = {
  input,
  output: {
    file: path.resolve(__dirname, './dist/index.d.ts'),
    format: 'esm',
  },
  external,
  plugins: [dts({ tsconfig: './tsconfig.json' })],
};

export default [esm, cjs, types];

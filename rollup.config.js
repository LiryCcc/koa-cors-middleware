import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import clear from 'rollup-plugin-clear';

const outDir = 'dist';

const rollupConfig = defineConfig({
  input: 'src/index.ts',
  output: [
    // 已有的格式
    {
      dir: outDir,
      format: 'cjs',
      entryFileNames: 'index.cjs',
      sourcemap: true
    },
    {
      dir: outDir,
      format: 'es',
      entryFileNames: 'index.js',
      sourcemap: true
    }
  ],
  external: ['koa', 'dayjs'],
  plugins: [
    clear({
      targets: [outDir]
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: outDir
    }),
    commonjs(),
    // 只能在node用
    resolve({ browser: false, preferBuiltins: true })
  ]
});

export default rollupConfig;

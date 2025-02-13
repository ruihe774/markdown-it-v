import babel from '@rollup/plugin-babel'
import plugin from 'rollup-plugin-dts'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'markdownitv',
        exports: 'default',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        exports: 'default',
        sourcemap: true,
      },
    ],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts'],
      }),
    ],
    watch: ['src/**'],
  },
  {
    input: 'typings/index.d.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
]

import dts from 'rollup-plugin-dts'

export default [
  {
    input: 'js/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'markdownitv',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
    ],
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

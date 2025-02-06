import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve';

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
    plugins: [babel({
      babelHelpers: 'bundled',
      extensions: [".ts"],
    })],
    watch: ['src/**'],
  },
]

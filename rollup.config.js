import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import cjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default [
    {
        input: 'src/index.js',
        output: [{
            file: 'dist/index.common.js',
            format: 'cjs',
            exports: 'default',
            sourcemap: true
        },
        {
            file: 'dist/index.esm.js',
            format: 'es',
            exports: 'default',
            sourcemap: true
        }],
        plugins: [
            babel()
        ],
        external: [
            'markdown-it/lib/renderer',
            'markdown-it/lib/common/utils',
            'lodash/flatten',
            'lodash/fromPairs',
            'css-tree'
        ],
        watch: [
            'src/**'
        ]
    },
    {
        input: 'src/testIndex.js',
        output: {
            file: 'dist/testIndex.iife.js',
            format: 'iife',
            exports: 'named',
            name: 'Test',
            sourcemap: true
        },
        plugins: [
            babel({
                exclude: 'node_modules/**'
            }),
            resolve({
                preferBuiltins: false
            }),
            cjs(),
            json()
        ],
        watch: [
            'src/**'
        ]
    }
]

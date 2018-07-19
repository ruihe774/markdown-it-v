import babel from 'rollup-plugin-babel'

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.common.js',
            format: 'cjs',
            exports: 'default'
        },
        plugins: [
            babel()
        ],
        external: [
            'markdown-it/lib/renderer',
            'markdown-it/lib/common/utils'
        ],
        watch: [
            'src/**'
        ]
    }
]

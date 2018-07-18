import babel from 'rollup-plugin-babel'

export default [
    {
        input: 'src/renderer.js',
        output: {
            file: 'dist/renderer.common.js',
            format: 'cjs',
            exports: 'default'
        },
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: {
                            node: 'current'
                        }
                    }]
                ],
                plugins: [
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-proposal-optional-chaining'
                ]
            })
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

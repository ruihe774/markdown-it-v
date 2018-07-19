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
            babel({
                babelrc: false,
                presets: [
                    ['@babel/preset-env', {
                        modules: false,
                        targets: {
                            node: '8.11.3'
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
            'markdown-it/lib/renderer'
        ],
        watch: [
            'src/**'
        ]
    }
]

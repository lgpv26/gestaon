module.exports = {
    devServer: {
        port: 3000
    },
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.(svg)(\?.*)?$/,
                    loader: 'vue-svg-loader'
                }
            ]
        }
    },
    chainWebpack: config => {
        config.module
            .rule('svg')
            .test(() => false)
            .use('file-loader')
    }
}
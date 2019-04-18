const path = require('path')

module.exports = {
    resolve: {
        alias: {
            '~server': path.join(__dirname, '/src/'),
            '~models': path.join(__dirname, '/src/models/'),
            '~controllers': path.join(__dirname, '/src/controllers/'),
            '~errors': path.join(__dirname, '/src/errors'),
            '~utils': path.join(__dirname, '/src/utils'),
            '~config': path.join(__dirname, '/src/config')
        }
    }
}
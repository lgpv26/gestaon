import _ from 'lodash'

let config = {
    apiBaseUrl: 'http://api.gestaon.com',
    socketServer: 'http://server.gestaon.com'
}

if(process.env.NODE_ENV !== 'production') {
    try {
        const developerConfig = require('./config.developer')
        _.assign(config, developerConfig)
        // do stuff
    } catch (err) {
        console.log("Developer config file not found.")

    }
}

module.exports = config
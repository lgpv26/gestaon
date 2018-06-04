import _ from 'lodash'

let config = {
    apiBaseUrl: 'http://api.gestaon.com',
    socketServer: 'http://server.gestaon.com',
    system: { // don't change settings under this object if you don't know what you're doing
        IDMappings: {
            paymentMethods: {
                bill: 4
            }
        }
    }
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